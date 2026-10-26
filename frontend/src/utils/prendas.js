import { normalizeText } from "./text.js";

/*
 * En el backend cada Producto es una variante (un talle y un color con su stock).
 * La web agrupa las variantes con el mismo nombre y categoría en una "prenda".
 */
const ORDEN_TALLES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

export function compararTalles(a, b) {
  const ia = ORDEN_TALLES.indexOf(String(a).toUpperCase());
  const ib = ORDEN_TALLES.indexOf(String(b).toUpperCase());
  if (ia !== -1 && ib !== -1) return ia - ib;
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  return String(a).localeCompare(String(b), "es");
}

export const claveDePrenda = (producto) => `${normalizeText(producto.nombre)}|${normalizeText(producto.categoria)}`;

export function agruparPrendas(productos) {
  const prendas = new Map();
  productos.forEach((producto) => {
    const clave = claveDePrenda(producto);
    if (!prendas.has(clave)) {
      prendas.set(clave, {
        clave,
        nombre: producto.nombre,
        categoria: producto.categoria,
        descripcion: producto.descripcion,
        imagen: "",
        variantes: [],
      });
    }
    const prenda = prendas.get(clave);
    prenda.variantes.push(producto);
    if (!prenda.imagen && producto.imagen) prenda.imagen = producto.imagen;
    if (!prenda.descripcion && producto.descripcion) prenda.descripcion = producto.descripcion;
  });

  return [...prendas.values()].map((prenda) => {
    const precios = prenda.variantes.map((variante) => Number(variante.precio));
    const colores = [...new Set(prenda.variantes.map((variante) => variante.color).filter(Boolean))];
    const talles = [...new Set(prenda.variantes.map((variante) => variante.talle).filter(Boolean))].sort(
      compararTalles,
    );
    return {
      ...prenda,
      // Código de la primera variante con stock: es la "puerta" al detalle de la prenda.
      codigo: (prenda.variantes.find((variante) => variante.stock > 0) ?? prenda.variantes[0]).codigo,
      colores,
      talles,
      precioMin: Math.min(...precios),
      precioMax: Math.max(...precios),
      stockTotal: prenda.variantes.reduce((suma, variante) => suma + Number(variante.stock), 0),
    };
  });
}

/** Busca la variante de una prenda por color y talle. */
export const buscarVariante = (prenda, { color, talle }) =>
  prenda.variantes.find(
    (variante) => (variante.color ?? "") === (color ?? "") && (variante.talle ?? "") === (talle ?? ""),
  ) ?? null;

/** Nombre corto de una variante para el carrito y los pedidos: "Remera oversize · M, Negro". */
export const nombreDeVariante = (producto) =>
  [producto.nombre, [producto.talle, producto.color].filter(Boolean).join(", ")].filter(Boolean).join(" · ");

const TINTES = {
  negro: "#26241f",
  blanco: "#f7f5f0",
  "gris melange": "#9d9b96",
  gris: "#8f8d88",
  azul: "#2f4f8f",
  celeste: "#9cc6e8",
  beige: "#d8c3a0",
  "verde oliva": "#6b6b3a",
  verde: "#3f7d4f",
  naranja: "#ff5a1f",
  rojo: "#c8352a",
  marron: "#6b4428",
  natural: "#d9b98c",
  bordo: "#6e1f2b",
};

/** Color de muestra para un nombre de color cargado como texto. Si no se conoce, uno neutro. */
export function tinteDeColor(nombreColor) {
  return TINTES[normalizeText(nombreColor)] ?? "#a59d90";
}
