import { http } from "./apiClient.js";

/*
 * Endpoints reales del backend (backend/src/routes/productoRoutes.js):
 *   GET    /api/productos            (público; ?todos=1 incluye desactivados para el admin)
 *   GET    /api/productos/:codigo
 *   POST   /api/productos            (admin)
 *   PUT    /api/productos/:codigo    (admin)
 *   DELETE /api/productos/:codigo    (admin)
 *   GET    /api/categorias
 */
const RESOURCE = "/productos";

export async function getProductos({ signal, todos = false } = {}) {
  const productos = await http.get(todos ? `${RESOURCE}?todos=1` : RESOURCE, { signal });
  return Array.isArray(productos) ? productos : [];
}

export function getProductoByCodigo(codigo, { signal } = {}) {
  return http.get(`${RESOURCE}/${encodeURIComponent(codigo)}`, { signal });
}

export function createProducto(producto) {
  return http.post(RESOURCE, producto);
}

export function updateProducto(codigo, cambios) {
  return http.put(`${RESOURCE}/${encodeURIComponent(codigo)}`, cambios);
}

export function deleteProducto(codigo) {
  return http.delete(`${RESOURCE}/${encodeURIComponent(codigo)}`);
}

export async function getCategorias({ signal } = {}) {
  const categorias = await http.get("/categorias", { signal });
  return Array.isArray(categorias) ? categorias : [];
}
