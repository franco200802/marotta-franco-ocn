import { useCallback } from "react";
import { useCart } from "./useCart.js";
import { useToast } from "./useToast.js";
import { getProductos } from "../services/productoService.js";

/** Vuelve a sumar al carrito lo de un pedido anterior, con los precios y el stock de hoy. */
export function usePedirDeNuevo() {
  const { agregar, abrirCajon, items } = useCart();
  const toast = useToast();

  return useCallback(
    async (pedido) => {
      try {
        const productos = await getProductos();
        let sumados = 0;
        let faltantes = 0;
        // Una por una: con sesión, cada prenda se guarda en el carrito del servidor.
        for (const detalle of pedido.detalles) {
          const producto = productos.find((p) => p.codigo === detalle.productoId);
          const enCarrito = items.find((item) => item.productoId === detalle.productoId)?.cantidad ?? 0;
          const cantidad = producto ? Math.min(detalle.cantidad, producto.stock - enCarrito) : 0;
          if (cantidad > 0 && (await agregar(producto, cantidad))) {
            sumados += 1;
          } else {
            faltantes += 1;
          }
        }
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
    [agregar, abrirCajon, items, toast],
  );
}
