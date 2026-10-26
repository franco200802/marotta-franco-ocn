import { http } from "./apiClient.js";

export function getReporteVentas({ desde, hasta, signal } = {}) {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  const query = params.toString();
  return http.get(query ? `/reportes/ventas?${query}` : "/reportes/ventas", { signal });
}
