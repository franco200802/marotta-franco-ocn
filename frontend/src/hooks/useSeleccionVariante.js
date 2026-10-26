import { useMemo, useState } from "react";
import { buscarVariante } from "../utils/prendas.js";

function inicial(prenda, codigoInicial) {
  const variante =
    prenda.variantes.find((v) => v.codigo === codigoInicial) ??
    prenda.variantes.find((v) => v.stock > 0) ??
    prenda.variantes[0];
  return { color: variante?.color ?? "", talle: variante?.talle ?? "" };
}

/** Color y talle elegidos de una prenda. Al cambiar de color, busca un talle con stock. */
export function useSeleccionVariante(prenda, codigoInicial) {
  const [seleccion, setSeleccion] = useState(() => inicial(prenda, codigoInicial));

  const variante = useMemo(() => buscarVariante(prenda, seleccion), [prenda, seleccion]);

  const elegirColor = (color) => {
    const mismoTalle = buscarVariante(prenda, { color, talle: seleccion.talle });
    const conStock = prenda.variantes.find((v) => v.color === color && v.stock > 0);
    const talle = mismoTalle?.stock > 0 ? seleccion.talle : ((conStock ?? mismoTalle)?.talle ?? seleccion.talle);
    setSeleccion({ color, talle });
  };

  const elegirTalle = (talle) => setSeleccion((actual) => ({ ...actual, talle }));

  return { ...seleccion, variante, elegirColor, elegirTalle };
}
