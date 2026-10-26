import { useCallback } from "react";
import { useCart } from "./useCart.js";
import { useToast } from "./useToast.js";
import { getProductos } from "../services/productoService.js";

/** Vuelve a sumar al carrito lo de un pedido anterior, con los precios y el stock de hoy. */
export function usePedirDeNuevo() {
  const { agregar, abrirCajon } = useCart();
  const toast = useToast();

  return useCallback(
    async (pedido) => {
      try {
        const productos = await getProductos();
        let sumados = 0;
        let faltantes = 0;
        pedido.detalles.forEach((detalle) => {
          const producto = productos.find((p) => p.codigo === detalle.productoId);
          if (producto && producto.stock > 0) {
            agregar(producto, Math.min(detalle.cantidad, producto.stock));
            sumados += 1;
          } else {
            faltantes += 1;
          }
        });
        if (sumados === 0) {
          toast.error("Ninguna de esas prendas tiene stock hoy.", "No pudimos repetir el pedido");
          return;
        }
        toast.success(
          faltantes > 0
            ? `Sumamos ${sumados} ${sumados === 1 ? "prenda" : "prendas"}; ${faltantes} ya no tienen stock.`
            : "Sumamos todo al carrito con los precios de hoy.",
          "Pedido repetido",
          { label: "Ver carrito", onClick: abrirCajon },
        );
      } catch (error) {
        toast.error(error.message, "No pudimos repetir el pedido");
      }
    },
    [agregar, abrirCajon, toast],
  );
}
