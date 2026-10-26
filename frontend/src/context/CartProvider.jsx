import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { CartContext } from "./cartContext.js";
import { guardarLocal, leerLocal } from "../utils/storage.js";
import { nombreDeVariante } from "../utils/prendas.js";

const CLAVE_CARRITO = "ocn.carrito";

/*
 * El carrito conserva los productos hasta confirmar la compra o vaciarlo (Análisis de Requerimientos).
 * Cada línea es una variante (talle y color). La cantidad nunca supera el stock conocido.
 */
function reducir(items, accion) {
  switch (accion.tipo) {
    case "agregar": {
      const { producto, cantidad } = accion;
      const existente = items.find((item) => item.productoId === producto.codigo);
      if (existente) {
        return items.map((item) =>
          item.productoId === producto.codigo
            ? {
                ...item,
                precio: producto.precio,
                stock: producto.stock,
                cantidad: Math.min(producto.stock, item.cantidad + cantidad),
              }
            : item,
        );
      }
      return [
        ...items,
        {
          productoId: producto.codigo,
          nombre: nombreDeVariante(producto),
          prenda: producto.nombre,
          categoria: producto.categoria,
          talle: producto.talle,
          color: producto.color,
          precio: producto.precio,
          stock: producto.stock,
          cantidad: Math.min(producto.stock, cantidad),
        },
      ];
    }
    case "cantidad":
      return items
        .map((item) =>
          item.productoId === accion.productoId
            ? { ...item, cantidad: Math.min(item.stock, Math.max(0, accion.cantidad)) }
            : item,
        )
        .filter((item) => item.cantidad > 0);
    case "sincronizar": {
      // Respuesta de /carrito/validar: precio vigente (RN-05) y stock actual (RN-01).
      const porId = new Map(accion.lineas.map((linea) => [linea.productoId, linea]));
      return items
        .map((item) => {
          const linea = porId.get(item.productoId);
          if (!linea) return item;
          if (!linea.disponible) return { ...item, stock: 0, cantidad: 0 };
          return {
            ...item,
            precio: linea.precioActual,
            stock: linea.stock,
            cantidad: Math.min(linea.stock, item.cantidad),
          };
        })
        .filter((item) => item.cantidad > 0);
    }
    case "quitar":
      return items.filter((item) => item.productoId !== accion.productoId);
    case "vaciar":
      return [];
    default:
      return items;
  }
}

const leerCarritoGuardado = () => {
  const guardado = leerLocal(CLAVE_CARRITO, []);
  return Array.isArray(guardado) ? guardado : [];
};

export default function CartProvider({ children }) {
  const [items, despachar] = useReducer(reducir, null, leerCarritoGuardado);
  const [cajonAbierto, setCajonAbierto] = useState(false);

  useEffect(() => {
    guardarLocal(CLAVE_CARRITO, items);
  }, [items]);

  const agregar = useCallback((producto, cantidad = 1) => despachar({ tipo: "agregar", producto, cantidad }), []);
  const cambiarCantidad = useCallback(
    (productoId, cantidad) => despachar({ tipo: "cantidad", productoId, cantidad }),
    [],
  );
  const quitar = useCallback((productoId) => despachar({ tipo: "quitar", productoId }), []);
  const vaciar = useCallback(() => despachar({ tipo: "vaciar" }), []);
  const sincronizar = useCallback((lineas) => despachar({ tipo: "sincronizar", lineas }), []);
  const abrirCajon = useCallback(() => setCajonAbierto(true), []);
  const cerrarCajon = useCallback(() => setCajonAbierto(false), []);

  const value = useMemo(
    () => ({
      items,
      cantidadTotal: items.reduce((suma, item) => suma + item.cantidad, 0),
      subtotal: items.reduce((suma, item) => suma + item.cantidad * item.precio, 0),
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      sincronizar,
      cajonAbierto,
      abrirCajon,
      cerrarCajon,
    }),
    [items, agregar, cambiarCantidad, quitar, vaciar, sincronizar, cajonAbierto, abrirCajon, cerrarCajon],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
