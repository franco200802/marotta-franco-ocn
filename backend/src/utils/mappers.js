import { Roles } from "../enums/Roles.js";

// Nunca se devuelve el hash de la contraseña.
export const toClientePublico = (cliente) => ({
  id: cliente.id,
  nombre: cliente.nombre,
  apellido: cliente.apellido,
  email: cliente.email,
  direccion: cliente.direccion,
  rol: Roles.CLIENTE,
});

export const toAdministradorPublico = (administrador) => ({
  id: administrador.id,
  nombre: administrador.nombre,
  apellido: administrador.apellido,
  email: administrador.email,
  rol: Roles.ADMIN,
});
