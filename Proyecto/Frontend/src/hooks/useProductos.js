import { useCallback } from "react";
import { getProductoByCodigo, getProductos } from "../services/productoService.js";
import { useApiResource } from "./useApiResource.js";

const fetchProductos = (signal) => getProductos({ signal });

export function useProductos() {
  const { data, ...rest } = useApiResource(fetchProductos);
  return { productos: data ?? [], ...rest };
}

export function useProducto(codigo) {
  const fetchProducto = useCallback((signal) => getProductoByCodigo(codigo, { signal }), [codigo]);
  const { data, ...rest } = useApiResource(fetchProducto);
  return { producto: data ?? null, ...rest };
}
