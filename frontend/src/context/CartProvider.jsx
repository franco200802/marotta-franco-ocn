import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CartContext } from "./cartContext.js";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";
import {
  actualizarCantidadCarrito,
  agregarAlCarrito,
  fusionarCarrito,
  getCarrito,
  quitarDelCarrito,
  vaciarCarrito,
} from "../services/carritoService.js";
import { guardarLocal, leerLocal } from "../utils/storage.js";
import { nombreDeVariante } from "../utils/prendas.js";
import { formatPrecio } from "../utils/format.js";

const CLAVE_CARRITO = "ocn.carrito";
const SIN_ITEMS = [];

/*
 * El carrito conserva los productos hasta confirmar la compra o vaciarlo (Análisis de Requerimientos).
 * - Cliente con sesión: el carrito se guarda en el servidor (Entrega 4); cada acción llama a la API
 *   y la pantalla muestra lo que responde el backend.
 * - Visitante: se guarda en el navegador y se valida contra la API antes de comprar.
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
      return [...items, { ...aLinea(producto), cantidad: Math.min(producto.stock, cantidad) }];
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

/** Datos de una variante que muestra el carrito. */
function aLinea(producto) {
  return {
    productoId: producto.codigo,
    nombre: nombreDeVariante(producto),
    prenda: producto.nombre,
    categoria: producto.categoria,
    talle: producto.talle,
    color: producto.color,
    precio: producto.precio,
    stock: producto.stock,
  };
}

/** Línea del carrito del servidor → misma forma que usa la interfaz. */
const desdeServidor = (linea) => ({ ...aLinea(linea.producto), cantidad: linea.cantidad });

/** Lo que cambió desde la última vez que el cliente vio su carrito (RN-05 y RN-01). */
function avisosDe(carrito) {
  const avisos = carrito.quitados.map(({ nombre }) => `${nombre} ya no tiene stock y se quitó del carrito.`);
  carrito.items.forEach((linea) => {
    const nombre = nombreDeVariante(linea.producto);
    if (linea.precioCambio) avisos.push(`${nombre} cambió de precio: ahora sale ${formatPrecio(linea.precioActual)}.`);
    if (linea.cantidadAjustada) avisos.push(`De ${nombre} quedan ${linea.stock}: ajustamos la cantidad.`);
  });
  return avisos;
}

const leerCarritoGuardado = () => {
  const guardado = leerLocal(CLAVE_CARRITO, []);
  return Array.isArray(guardado) ? guardado : [];
};

export default function CartProvider({ children }) {
  const { usuario, esCliente } = useAuth();
  const toast = useToast();
  const [itemsLocales, despachar] = useReducer(reducir, null, leerCarritoGuardado);
  const [itemsServidor, setItemsServidor] = useState([]);
  const [avisosServidor, setAvisosServidor] = useState([]);
  const [clienteListo, setClienteListo] = useState(null); // cliente cuyo carrito ya llegó del servidor
  const [cajonAbierto, setCajonAbierto] = useState(false);
  const itemsLocalesRef = useRef(itemsLocales);
  const clienteCargado = useRef(null);
  const ultimaPeticion = useRef(0);

  const enServidor = esCliente;
  const clienteId = esCliente ? usuario.id : null;
  const cargando = enServidor && clienteListo !== clienteId;

  useEffect(() => {
    itemsLocalesRef.current = itemsLocales;
    guardarLocal(CLAVE_CARRITO, itemsLocales);
  }, [itemsLocales]);

  /**
   * Muestra la respuesta del servidor, salvo que ya haya llegado una petición más nueva.
   * Los avisos de cambios se informan una sola vez: una lectura sin cambios no borra los anteriores,
   * pero cuando el cliente modifica el carrito se limpian.
   */
  const aplicar = useCallback((carrito, numero, { lectura = true } = {}) => {
    if (numero !== ultimaPeticion.current) return;
    setItemsServidor(carrito.items.map(desdeServidor));
    const avisos = avisosDe(carrito);
    if (!lectura || avisos.length > 0) setAvisosServidor(avisos);
  }, []);

  const pedirAlServidor = useCallback(
    async (operacion, tituloError, { lectura = false } = {}) => {
      const numero = ++ultimaPeticion.current;
      try {
        aplicar(await operacion(), numero, { lectura });
        return true;
      } catch (error) {
        if (tituloError) toast.error(error.message, tituloError);
        // Si falló por stock o porque la prenda ya no está, se muestra el carrito real.
        if (error.isConflict || error.isNotFound) {
          const otra = ++ultimaPeticion.current;
          getCarrito()
            .then((carrito) => aplicar(carrito, otra))
            .catch(() => {});
        }
        return false;
      }
    },
    [aplicar, toast],
  );

  // Al iniciar sesión como cliente: se suma lo que había en el navegador y se usa el carrito del servidor.
  useEffect(() => {
    if (!clienteId) {
      clienteCargado.current = null;
      return;
    }
    if (clienteCargado.current === clienteId) return; // StrictMode monta dos veces: se fusiona una sola vez
    clienteCargado.current = clienteId;

    const pendientes = itemsLocalesRef.current.map(({ productoId, cantidad }) => ({ productoId, cantidad }));
    pedirAlServidor(
      () => (pendientes.length > 0 ? fusionarCarrito(pendientes) : getCarrito()),
      "No pudimos cargar tu carrito",
      { lectura: true },
    ).then((ok) => {
      if (ok && pendientes.length > 0) despachar({ tipo: "vaciar" });
      setClienteListo(clienteId);
    });
  }, [clienteId, pedirAlServidor]);

  const agregar = useCallback(
    async (producto, cantidad = 1) => {
      if (!enServidor) {
        despachar({ tipo: "agregar", producto, cantidad });
        return true;
      }
      return pedirAlServidor(() => agregarAlCarrito(producto.codigo, cantidad), "No pudimos sumarlo al carrito");
    },
    [enServidor, pedirAlServidor],
  );

  const quitar = useCallback(
    async (productoId) => {
      if (!enServidor) {
        despachar({ tipo: "quitar", productoId });
        return true;
      }
      setItemsServidor((actuales) => actuales.filter((item) => item.productoId !== productoId));
      return pedirAlServidor(() => quitarDelCarrito(productoId), "No pudimos quitar la prenda");
    },
    [enServidor, pedirAlServidor],
  );

  const cambiarCantidad = useCallback(
    async (productoId, cantidad) => {
      if (!enServidor) {
        despachar({ tipo: "cantidad", productoId, cantidad });
        return true;
      }
      if (cantidad <= 0) return quitar(productoId);
      // Se muestra el cambio enseguida; si el servidor lo rechaza, vuelve lo que tiene guardado.
      setItemsServidor((actuales) =>
        actuales.map((item) => (item.productoId === productoId ? { ...item, cantidad } : item)),
      );
      return pedirAlServidor(() => actualizarCantidadCarrito(productoId, cantidad), "No pudimos cambiar la cantidad");
    },
    [enServidor, pedirAlServidor, quitar],
  );

  const vaciar = useCallback(async () => {
    if (!enServidor) {
      despachar({ tipo: "vaciar" });
      return true;
    }
    return pedirAlServidor(vaciarCarrito, "No pudimos vaciar el carrito");
  }, [enServidor, pedirAlServidor]);

  /** Vuelve a leer el carrito del servidor (precio vigente y stock). */
  const revisar = useCallback(() => pedirAlServidor(getCarrito, null, { lectura: true }), [pedirAlServidor]);

  /** Después de comprar: el servidor ya sacó lo comprado; el visitante vacía el del navegador. */
  const despuesDeComprar = useCallback(() => (enServidor ? revisar() : vaciar()), [enServidor, revisar, vaciar]);

  const sincronizar = useCallback((lineas) => despachar({ tipo: "sincronizar", lineas }), []);
  const abrirCajon = useCallback(() => setCajonAbierto(true), []);
  const cerrarCajon = useCallback(() => setCajonAbierto(false), []);

  // Mientras llega el carrito del cliente no se muestra el de otra sesión.
  const items = !enServidor ? itemsLocales : cargando ? SIN_ITEMS : itemsServidor;

  const value = useMemo(
    () => ({
      items,
      enServidor,
      cargando,
      avisosServidor,
      cantidadTotal: items.reduce((suma, item) => suma + item.cantidad, 0),
      subtotal: items.reduce((suma, item) => suma + item.cantidad * item.precio, 0),
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      revisar,
      despuesDeComprar,
      sincronizar,
      cajonAbierto,
      abrirCajon,
      cerrarCajon,
    }),
    [
      items,
      enServidor,
      cargando,
      avisosServidor,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      revisar,
      despuesDeComprar,
      sincronizar,
      cajonAbierto,
      abrirCajon,
      cerrarCajon,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
