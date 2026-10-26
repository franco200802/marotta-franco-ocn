import Producto from "../models/Producto.js";
import Administrador from "../models/Administrador.js";
import ZonaEnvio from "../models/ZonaEnvio.js";
import Configuracion from "../models/Configuracion.js";
import Local from "../models/Local.js";
import ProductoRepository from "./ProductoRepository.js";
import ClienteRepository from "./ClienteRepository.js";
import AdministradorRepository from "./AdministradorRepository.js";
import PedidoRepository from "./PedidoRepository.js";
import DetallePedidoRepository from "./DetallePedidoRepository.js";
import EnvioRepository from "./EnvioRepository.js";
import ZonaEnvioRepository from "./ZonaEnvioRepository.js";
import ConfiguracionRepository from "./ConfiguracionRepository.js";
import LocalRepository from "./LocalRepository.js";
import { config } from "../utils/config.js";
import { hashearPasswordSync } from "../utils/password.js";
import { normalizeEmail } from "../utils/validators.js";

// Datos REALES del local, relevados en la Ficha Técnica de OCN Villa Urquiza.
const LOCAL = new Local(
  1,
  "OCN Villa Urquiza",
  "Bauness 2395 esq. Monroe, C1431, CABA",
  "Villa Urquiza",
  "Lunes a sábado de 10:30 a 19:30. Domingos cerrado.",
  "011 6106-6755",
  "@ocn.villaurquiza",
  4.6,
  24,
);

// TODO EJEMPLO: catálogo, precios y stock de ejemplo hasta que el local cargue los reales.
// Cada producto es una variante (un talle y un color) con su propio stock.
const PRODUCTOS_EJEMPLO = [
  ["Remera oversize", "Remeras", "S", "Negro", "Remera de algodón peinado, corte amplio.", 18900, 6],
  ["Remera oversize", "Remeras", "M", "Negro", "Remera de algodón peinado, corte amplio.", 18900, 8],
  ["Remera oversize", "Remeras", "L", "Negro", "Remera de algodón peinado, corte amplio.", 18900, 4],
  ["Remera oversize", "Remeras", "M", "Blanco", "Remera de algodón peinado, corte amplio.", 18900, 5],
  ["Remera oversize", "Remeras", "XL", "Blanco", "Remera de algodón peinado, corte amplio.", 18900, 2],
  ["Buzo canguro", "Buzos", "M", "Gris melange", "Buzo de algodón frizado con bolsillo canguro.", 39500, 5],
  ["Buzo canguro", "Buzos", "L", "Gris melange", "Buzo de algodón frizado con bolsillo canguro.", 39500, 3],
  ["Buzo canguro", "Buzos", "XL", "Negro", "Buzo de algodón frizado con bolsillo canguro.", 39500, 1],
  ["Jean recto", "Jeans", "40", "Azul", "Jean de corte recto, tiro medio.", 46000, 4],
  ["Jean recto", "Jeans", "42", "Azul", "Jean de corte recto, tiro medio.", 46000, 6],
  ["Jean recto", "Jeans", "44", "Azul", "Jean de corte recto, tiro medio.", 46000, 2],
  ["Pantalón chino", "Chinos", "42", "Beige", "Chino de gabardina con un toque de lycra.", 42000, 5],
  ["Pantalón chino", "Chinos", "44", "Verde oliva", "Chino de gabardina con un toque de lycra.", 42000, 3],
  ["Camisa de gabardina", "Camisas", "M", "Celeste", "Camisa de manga larga para salir.", 36000, 4],
  ["Gorra trucker", "Gorras", "Único", "Negro", "Gorra con frente bordado y red atrás.", 15500, 10],
  ["Gorra trucker", "Gorras", "Único", "Naranja", "Gorra con frente bordado y red atrás.", 15500, 7],
  ["Billetera de cuero", "Billeteras", "Único", "Marrón", "Billetera chica con monedero.", 21000, 6],
  ["Cinto de cuero", "Cintos", "Único", "Negro", "Cinto de cuero con hebilla metálica.", 19500, 5],
  ["Skate completo", "Skates", "Único", "Natural", "Tabla de 8 pulgadas armada.", 98000, 0],
];

// TODO EJEMPLO: zonas y costos de envío hasta que el local defina los reales.
const ZONAS_EJEMPLO = [
  ["Villa Urquiza y barrios vecinos", "Villa Urquiza, Coghlan, Villa Pueyrredón, Saavedra y Belgrano R.", 3500],
  ["Resto de CABA", "Cualquier otro barrio de la Ciudad.", 6000],
  ["GBA Norte", "Vicente López, San Isidro y San Martín.", 9500],
];

// TODO EJEMPLO: monto mínimo para envío gratis (RN-04), lo fija el administrador.
const MONTO_MINIMO_ENVIO_GRATIS_EJEMPLO = 90000;

/** Deja los repositorios en su estado inicial. Se puede llamar más de una vez (tests). */
export function cargarDatosIniciales() {
  [
    ProductoRepository,
    ClienteRepository,
    AdministradorRepository,
    PedidoRepository,
    DetallePedidoRepository,
    EnvioRepository,
    ZonaEnvioRepository,
  ].forEach((repositorio) => repositorio.clear());

  PRODUCTOS_EJEMPLO.forEach(([nombre, categoria, talle, color, descripcion, precio, stock]) => {
    ProductoRepository.create(new Producto(null, nombre, categoria, talle, color, descripcion, precio, stock, ""));
  });

  ZONAS_EJEMPLO.forEach(([nombre, descripcion, costo]) => {
    ZonaEnvioRepository.save(new ZonaEnvio(null, nombre, descripcion, costo));
  });

  ConfiguracionRepository.set(new Configuracion(MONTO_MINIMO_ENVIO_GRATIS_EJEMPLO));
  LocalRepository.set(LOCAL);

  AdministradorRepository.save(
    new Administrador(
      null,
      "Administración",
      "OCN",
      normalizeEmail(config.adminEmail),
      hashearPasswordSync(config.adminPassword),
    ),
  );
}
