import { useEffect, useRef, useState } from "react";
import { useCart } from "./useCart.js";
import { validarCarrito } from "../services/carritoService.js";
import { formatPrecio } from "../utils/format.js";

/** Revisa el carrito contra el servidor una vez por visita: precio vigente (RN-05) y stock (RN-01). */
export function useValidacionCarrito() {
  const { items, sincronizar } = useCart();
  const [avisos, setAvisos] = useState([]);
  const yaValidado = useRef(false);

  useEffect(() => {
    if (yaValidado.current || items.length === 0) return undefined;
    yaValidado.current = true;
    const controller = new AbortController();
    validarCarrito(
      items.map(({ productoId, cantidad, precio }) => ({ productoId, cantidad, precio })),
      { signal: controller.signal },
    )
      .then((resultado) => {
        const nuevos = [];
        resultado.items.forEach((linea) => {
          const item = items.find((i) => i.productoId === linea.productoId);
          if (!item) return;
          if (!linea.disponible) nuevos.push(`${item.nombre} ya no tiene stock y se quitó del carrito.`);
          else if (linea.precioCambio)
            nuevos.push(`${item.nombre} cambió de precio: ahora sale ${formatPrecio(linea.precioActual)}.`);
          else if (!linea.cantidadValida)
            nuevos.push(`De ${item.nombre} quedan ${linea.stock}: ajustamos la cantidad.`);
        });
        sincronizar(resultado.items);
        setAvisos(nuevos);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [items, sincronizar]);

  return avisos;
}
