import { http } from "./apiClient.js";

export const actualizarPerfil = (datos) => http.put("/clientes/perfil", datos);

/** Administrador */
export const getClientes = ({ signal } = {}) => http.get("/clientes", { signal });
export const cambiarEstadoCliente = (id, activo) =>
  http.patch(`/clientes/${encodeURIComponent(id)}/estado`, { activo });
