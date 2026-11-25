import { http } from "./apiClient.js";

/** Visitantes: RN-05 y RN-01, precio vigente y stock de cada línea guardada en el navegador. */
export const validarCarrito = (items, { signal } = {}) => http.post("/carrito/validar", { items }, { signal });

/*
 * Clientes con sesión: el carrito se guarda en el servidor (Entrega 4).
 * Cada operación devuelve el carrito completo: { items, quitados, cantidadTotal, subtotal, hayCambios }.
 */
export const getCarrito = ({ signal } = {}) => http.get("/carrito", { signal });
export const agregarAlCarrito = (productoId, cantidad) => http.post("/carrito/items", { productoId, cantidad });
export const actualizarCantidadCarrito = (productoId, cantidad) =>
  http.put(`/carrito/items/${encodeURIComponent(productoId)}`, { cantidad });
export const quitarDelCarrito = (productoId) => http.delete(`/carrito/items/${encodeURIComponent(productoId)}`);
export const vaciarCarrito = () => http.delete("/carrito");
/** Suma al carrito del servidor lo que el visitante tenía en el navegador antes de iniciar sesión. */
export const fusionarCarrito = (items) => http.post("/carrito/fusionar", { items });
