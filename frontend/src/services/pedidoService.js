import { http } from "./apiClient.js";

export const crearPedido = (datos) => http.post("/pedidos", datos);
export const getMisPedidos = ({ signal } = {}) => http.get("/pedidos/mios", { signal });
export const getPedido = (id, { signal } = {}) => http.get(`/pedidos/${encodeURIComponent(id)}`, { signal });
export const cancelarPedido = (id) => http.patch(`/pedidos/${encodeURIComponent(id)}/cancelar`);

/** Administrador */
export const getPedidos = ({ signal, estado } = {}) =>
  http.get(estado ? `/pedidos?estado=${encodeURIComponent(estado)}` : "/pedidos", { signal });
export const cambiarEstadoPedido = (id, estado) => http.patch(`/pedidos/${encodeURIComponent(id)}/estado`, { estado });
