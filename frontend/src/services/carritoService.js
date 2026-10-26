import { http } from "./apiClient.js";

/** RN-05 y RN-01: precio vigente y stock de cada línea antes de confirmar. */
export const validarCarrito = (items, { signal } = {}) => http.post("/carrito/validar", { items }, { signal });
