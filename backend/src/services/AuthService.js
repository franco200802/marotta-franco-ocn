import Cliente from "../models/Cliente.js";
import clienteRepository from "../repositories/ClienteRepository.js";
import administradorRepository from "../repositories/AdministradorRepository.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { Roles } from "../enums/Roles.js";
import { compararPassword, hashearPassword } from "../utils/password.js";
import { firmarToken } from "../utils/token.js";
import { toAdministradorPublico, toClientePublico } from "../utils/mappers.js";
import { isEmail, isNonEmptyString, isValidPassword, normalizeEmail } from "../utils/validators.js";

class AuthService {
  async registrar(datos) {
    const { nombre, apellido, email, password, direccion } = datos ?? {};

    if (![nombre, apellido, email, password, direccion].every(isNonEmptyString)) {
      throw new BadRequestError(Messages.CAMPOS_OBLIGATORIOS);
    }
    if (!isEmail(email)) {
      throw new BadRequestError(Messages.EMAIL_INVALIDO);
    }
    if (!isValidPassword(password)) {
      throw new BadRequestError(Messages.PASSWORD_DEBIL);
    }

    const emailNormalizado = normalizeEmail(email);
    // RN-02: cada email se registra una sola vez (tampoco puede usar el del administrador).
    if (clienteRepository.findByEmail(emailNormalizado) || administradorRepository.findByEmail(emailNormalizado)) {
      throw new ConflictError(Messages.EMAIL_DUPLICADO);
    }

    const cliente = clienteRepository.save(
      new Cliente(
        null,
        nombre.trim(),
        apellido.trim(),
        emailNormalizado,
        await hashearPassword(password),
        direccion.trim(),
      ),
    );

    return { token: firmarToken(cliente, Roles.CLIENTE), usuario: toClientePublico(cliente) };
  }

  async iniciarSesion(datos) {
    const { email, password } = datos ?? {};
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      throw new BadRequestError(Messages.CREDENCIALES_INVALIDAS);
    }

    const emailNormalizado = normalizeEmail(email);
    const administrador = administradorRepository.findByEmail(emailNormalizado);
    if (administrador && (await compararPassword(password, administrador.password))) {
      return { token: firmarToken(administrador, Roles.ADMIN), usuario: toAdministradorPublico(administrador) };
    }

    const cliente = clienteRepository.findByEmail(emailNormalizado);
    if (cliente && (await compararPassword(password, cliente.password))) {
      return { token: firmarToken(cliente, Roles.CLIENTE), usuario: toClientePublico(cliente) };
    }

    // Mismo mensaje para email inexistente o contraseña incorrecta.
    throw new UnauthorizedError(Messages.CREDENCIALES_INVALIDAS);
  }
}

export default new AuthService();
