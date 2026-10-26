import { http } from "./apiClient.js";

export const actualizarPerfil = (datos) => http.put("/clientes/perfil", datos);
export const getClientes = ({ signal } = {}) => http.get("/clientes", { signal });
