import { http } from "./apiClient.js";

export const getZonasEnvio = ({ signal } = {}) => http.get("/envios/zonas", { signal });
export const cotizarEnvio = (datos, { signal } = {}) => http.post("/envios/cotizar", datos, { signal });
export const actualizarConfiguracionEnvio = (datos) => http.put("/envios/configuracion", datos);
