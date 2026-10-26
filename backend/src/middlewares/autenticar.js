import { Messages } from "../enums/Messages.js";
import { ForbiddenError, UnauthorizedError } from "../exceptions/AppError.js";
import { verificarToken } from "../utils/token.js";

const PREFIJO = "Bearer ";

function leerUsuario(req) {
  const encabezado = req.headers.authorization;
  if (!encabezado?.startsWith(PREFIJO)) {
    return null;
  }
  const payload = verificarToken(encabezado.slice(PREFIJO.length));
  return { id: Number(payload.sub), rol: payload.rol };
}

/** Exige un token válido y deja el usuario en req.usuario. */
export function autenticar(req, res, next) {
  try {
    req.usuario = leerUsuario(req);
    if (!req.usuario) {
      throw new UnauthorizedError(Messages.TOKEN_REQUERIDO);
    }
    next();
  } catch (error) {
    next(error);
  }
}

/** Si viene un token válido lo usa; si no viene o venció, sigue como visitante (rutas públicas). */
export function autenticarOpcional(req, res, next) {
  try {
    req.usuario = leerUsuario(req);
  } catch {
    req.usuario = null;
  }
  next();
}

/** Debe ir después de autenticar: permite el paso solo a los roles indicados. */
export const autorizar =
  (...roles) =>
  (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return next(new ForbiddenError(Messages.ACCESO_DENEGADO));
    }
    next();
  };
