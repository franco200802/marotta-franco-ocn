import { normalizeText } from "../../utils/text.js";
import { tinteDeColor } from "../../utils/prendas.js";
import "./ProductoArte.css";

/*
 * Dibujos de prenda en SVG, teñidos con el color del producto.
 * El local todavía no tiene fotos propias: si el producto trae imagen, se usa la imagen.
 */
const TINTA = "#1C1B19";

const DIBUJOS = {
  remera: (
    <>
      <path d="M70 30 50 38 18 62l16 30 18-10v88h96V82l18 10 16-30-32-24-20-8q-30 22-60 0Z" />
      <path className="arte__puntada" d="M74 35q26 20 52 0M58 160h84M40 70l12 22M160 70l-12 22" />
    </>
  ),
  buzo: (
    <>
      <path d="M72 34 46 44 24 110l-2 50 22 2 8-62v72h96v-72l8 62 22-2-2-50-22-66-26-10Z" />
      <path d="M72 34q28-30 56 0-28 18-56 0Z" />
      <path className="arte__relleno-claro" d="M74 128h52l8 32H66Z" />
      <path className="arte__puntada" d="M92 46v26M108 46v26M56 160h88" />
    </>
  ),
  camisa: (
    <>
      <path d="M72 30 46 40 24 108l-2 52 22 2 8-62v70h96v-70l8 62 22-2-2-52-22-68-26-10-28 18Z" />
      <path className="arte__relleno-claro" d="M72 30l28 22 28-22 8 18-36 10-36-10Z" />
      <path className="arte__puntada" d="M100 58v110" />
      <circle className="arte__boton" cx="106" cy="76" r="3.5" />
      <circle className="arte__boton" cx="106" cy="104" r="3.5" />
      <circle className="arte__boton" cx="106" cy="132" r="3.5" />
    </>
  ),
  pantalon: (
    <>
      <path d="M60 22h80l12 156h-38L100 80l-14 98H48Z" />
      <path className="arte__puntada" d="M60 38h80M72 40q2 22 22 26M128 40q-2 22-22 26M100 38v40" />
    </>
  ),
  gorra: (
    <>
      <path d="M40 122q0-72 60-72t60 72Z" />
      <path className="arte__relleno-claro" d="M40 122q60-14 146 6-16 18-76 12-50-4-70-18Z" />
      <path className="arte__puntada" d="M100 52v68M72 58q-8 30-6 62M128 58q8 30 6 62" />
      <circle className="arte__boton" cx="100" cy="50" r="6" />
    </>
  ),
  billetera: (
    <>
      <rect x="34" y="60" width="132" height="90" rx="14" />
      <path className="arte__relleno-claro" d="M34 74q0-14 14-14h104q14 0 14 14v18H34Z" />
      <rect className="arte__puntada" x="44" y="70" width="112" height="70" rx="8" />
      <circle className="arte__boton" cx="150" cy="92" r="5" />
    </>
  ),
  cinto: (
    <>
      <rect x="14" y="86" width="172" height="28" rx="8" />
      <rect className="arte__hebilla" x="58" y="76" width="36" height="48" rx="7" />
      <path className="arte__puntada" d="M100 92h80M100 108h80" />
      <circle className="arte__boton" cx="130" cy="100" r="3" />
      <circle className="arte__boton" cx="146" cy="100" r="3" />
      <circle className="arte__boton" cx="162" cy="100" r="3" />
    </>
  ),
  skate: (
    <>
      <g transform="rotate(-12 100 100)">
        <rect x="16" y="84" width="168" height="34" rx="17" />
        <path className="arte__puntada" d="M36 101h128" />
        <circle className="arte__rueda" cx="56" cy="130" r="11" />
        <circle className="arte__rueda" cx="144" cy="130" r="11" />
      </g>
    </>
  ),
  perfume: (
    <>
      <rect x="62" y="76" width="76" height="96" rx="18" />
      <rect className="arte__relleno-claro" x="82" y="44" width="36" height="32" rx="6" />
      <path className="arte__puntada" d="M76 108h48" />
    </>
  ),
  etiqueta: (
    <>
      <path d="M60 36h80l20 24v110q0 8-8 8H48q-8 0-8-8V60Z" />
      <circle className="arte__relleno-claro" cx="100" cy="62" r="9" />
      <path className="arte__puntada" d="M58 100h84M58 124h84M58 148h56" />
    </>
  ),
};

const TIPOS = [
  ["remera", "remera"],
  ["buzo", "buzo"],
  ["campera", "buzo"],
  ["camisa", "camisa"],
  ["jean", "pantalon"],
  ["chino", "pantalon"],
  ["pantal", "pantalon"],
  ["gorra", "gorra"],
  ["billetera", "billetera"],
  ["cinto", "cinto"],
  ["skate", "skate"],
  ["perfume", "perfume"],
];

function tipoDePrenda(nombre, categoria) {
  const texto = normalizeText(`${categoria} ${nombre}`);
  return TIPOS.find(([palabra]) => texto.includes(palabra))?.[1] ?? "etiqueta";
}

function esOscuro(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}

export default function ProductoArte({ nombre = "", categoria = "", color = "", titulo, className = "" }) {
  const tinte = tinteDeColor(color);
  const tipo = tipoDePrenda(nombre, categoria);

  return (
    <svg
      className={`producto-arte ${esOscuro(tinte) ? "producto-arte--oscuro" : ""} ${className}`.trim()}
      viewBox="0 0 200 200"
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
      style={{ "--arte-tinte": tinte, "--arte-tinta": TINTA }}
    >
      <g className="arte__figura">{DIBUJOS[tipo]}</g>
    </svg>
  );
}
