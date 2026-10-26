import clienteRepository from "../repositories/ClienteRepository.js";
import administradorRepository from "../repositories/AdministradorRepository.js";
import pedidoRepository from "../repositories/PedidoRepository.js";
import { BadRequestError, ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { Roles } from "../enums/Roles.js";
import { EstadoPedido } from "../enums/EstadoPedido.js";
import { hashearPassword } from "../utils/password.js";
import { toAdministradorPublico, toClientePublico } from "../utils/mappers.js";
import { isEmail, isNonEmptyString, isValidPassword, normalizeEmail } from "../utils/validators.js";

class ClienteService {
  obtenerPerfil(usuario) {
    if (usuario.rol === Roles.ADMIN) {
      const administrador = administradorRepository.findById(usuario.id);
      if (!administrador) {
        throw new NotFoundError(Messages.CLIENTE_NOT_FOUND);
      }
      return toAdministradorPublico(administrador);
    }
    return toClientePublico(this.#exigirCliente(usuario.id));
  }

  async actualizarPerfil(clienteId, datos) {
    const cliente = this.#exigirCliente(clienteId);
    const cambios = {};

    for (const campo of ["nombre", "apellido", "direccion"]) {
      if (datos?.[campo] !== undefined) {
        if (!isNonEmptyString(datos[campo])) {
          throw new BadRequestError(Messages.CAMPOS_OBLIGATORIOS);
        }
        cambios[campo] = datos[campo].trim();
      }
    }

    if (datos?.email !== undefined) {
      if (!isEmail(datos.email)) {
        throw new BadRequestError(Messages.EMAIL_INVALIDO);
      }
      const email = normalizeEmail(datos.email);
      const otroCliente = clienteRepository.findByEmail(email);
      if ((otroCliente && otroCliente.id !== cliente.id) || administradorRepository.findByEmail(email)) {
        throw new ConflictError(Messages.EMAIL_DUPLICADO);
      }
      cambios.email = email;
    }

    if (datos?.password !== undefined && datos.password !== "") {
      if (!isValidPassword(datos.password)) {
        throw new BadRequestError(Messages.PASSWORD_DEBIL);
      }
      cambios.password = await hashearPassword(datos.password);
    }

    return toClientePublico(clienteRepository.update(cliente.id, cambios));
  }

  /** Listado para el administrador, con un resumen de compras de cada cliente. */
  listar() {
    return clienteRepository.findAll().map((cliente) => {
      const pedidos = pedidoRepository.findByClienteId(cliente.id);
      const validos = pedidos.filter((pedido) => pedido.estado !== EstadoPedido.CANCELADO);
      return {
        ...toClientePublico(cliente),
        cantidadPedidos: pedidos.length,
        totalComprado: validos.reduce((suma, pedido) => suma + pedido.total, 0),
      };
    });
  }

  #exigirCliente(id) {
    const cliente = clienteRepository.findById(id);
    if (!cliente) {
      throw new NotFoundError(Messages.CLIENTE_NOT_FOUND);
    }
    return cliente;
  }
}

export default new ClienteService();
