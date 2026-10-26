import { useCallback } from "react";
import { useCart } from "./useCart.js";
import { useToast } from "./useToast.js";
import { nombreDeVariante } from "../utils/prendas.js";

/** Suma una variante al carrito y avisa con un toast que ofrece abrir el carrito. */
export function useSumarAlCarrito() {
  const { agregar, abrirCajon, items } = useCart();
  const toast = useToast();

  return useCallback(
    (variante, cantidad = 1) => {
      const enCarrito = items.find((item) => item.productoId === variante.codigo)?.cantidad ?? 0;
      if (variante.stock <= 0 || enCarrito >= variante.stock) {
        toast.error(`Ya tenés en el carrito todo el stock de ${nombreDeVariante(variante)}.`, "Sin más stock");
        return false;
      }
      agregar(variante, cantidad);
      toast.success(`${nombreDeVariante(variante)} está en tu carrito.`, "Sumado al carrito", {
        label: "Ver carrito",
        onClick: abrirCajon,
      });
      return true;
    },
    [agregar, abrirCajon, items, toast],
  );
}
