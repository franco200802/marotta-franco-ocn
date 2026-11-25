import { Roles } from "../enums/Roles.js";

// Nunca se devuelve el hash de la contraseña.
export const toClientePublico = (cliente) => ({
  id: cliente.id,
  nombre: cliente.nombre,
  apellido: cliente.apellido,
  email: cliente.email,
  direccion: cliente.direccion,
  activo: cliente.activo,
  rol: Roles.CLIENTE,
});

/** "Remera oversize · M, Negro": nombre de una variante para el carrito y el detalle del pedido. */
export const nombreDeVariante = (producto) =>
  [producto.nombre, [producto.talle, producto.color].filter(Boolean).join(", ")].filter(Boolean).join(" · ");

export const toAdministradorPublico = (administrador) => ({
  id: administrador.id,
  nombre: administrador.nombre,
  apellido: administrador.apellido,
  email: administrador.email,
  rol: Roles.ADMIN,
});
