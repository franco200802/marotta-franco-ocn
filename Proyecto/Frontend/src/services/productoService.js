import { apiRequest } from "./apiClient.js";

/*
 * Endpoints reales del backend (Backend/src/routes/productoRoutes.js):
 *   GET    /api/productos
 *   GET    /api/productos/:codigo
 *   POST   /api/productos
 *   PUT    /api/productos/:codigo
 *   DELETE /api/productos/:codigo
 */
const RESOURCE = "/productos";

export async function getProductos({ signal } = {}) {
  const productos = await apiRequest(RESOURCE, { signal });
  return Array.isArray(productos) ? productos : [];
}

export function getProductoByCodigo(codigo, { signal } = {}) {
  return apiRequest(`${RESOURCE}/${encodeURIComponent(codigo)}`, { signal });
}

export function createProducto(producto) {
  return apiRequest(RESOURCE, { method: "POST", body: producto });
}

export function updateProducto(codigo, cambios) {
  return apiRequest(`${RESOURCE}/${encodeURIComponent(codigo)}`, { method: "PUT", body: cambios });
}

export function deleteProducto(codigo) {
  return apiRequest(`${RESOURCE}/${encodeURIComponent(codigo)}`, { method: "DELETE" });
}
