import pedidoRepository from "../repositories/PedidoRepository.js";
import detallePedidoRepository from "../repositories/DetallePedidoRepository.js";
import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { EstadoPedido } from "../enums/EstadoPedido.js";

const UN_DIA_MS = 24 * 60 * 60 * 1000;
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Los días se cuentan con la hora de Buenos Aires (un pedido de las 22 h no pasa al día siguiente).
const formatoDia = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
const diaLocal = (fecha) => formatoDia.format(fecha);
const aFechaIso = (fecha) => fecha.toISOString().slice(0, 10);

function leerFecha(valor, porDefecto) {
  if (valor === undefined || valor === "") {
    return porDefecto;
  }
  if (typeof valor !== "string" || !FECHA_REGEX.test(valor) || Number.isNaN(Date.parse(valor))) {
    throw new BadRequestError(Messages.FECHA_INVALIDA);
  }
  return valor;
}

class ReporteService {
  /** Ventas del período (por defecto, los últimos 30 días). Los pedidos cancelados no suman. */
  ventas({ desde, hasta } = {}) {
    const hoy = new Date();
    const fechaHasta = leerFecha(hasta, diaLocal(hoy));
    const fechaDesde = leerFecha(desde, diaLocal(new Date(hoy.getTime() - 29 * UN_DIA_MS)));
    if (fechaDesde > fechaHasta) {
      throw new BadRequestError(Messages.FECHA_INVALIDA);
    }

    const delPeriodo = pedidoRepository.findAll().filter((pedido) => {
      const dia = diaLocal(new Date(pedido.fecha));
      return dia >= fechaDesde && dia <= fechaHasta;
    });
    const ventas = delPeriodo.filter((pedido) => pedido.estado !== EstadoPedido.CANCELADO);
    const totalVendido = ventas.reduce((suma, pedido) => suma + pedido.total, 0);

    const porEstado = Object.values(EstadoPedido).map((estado) => ({
      estado,
      cantidad: delPeriodo.filter((pedido) => pedido.estado === estado).length,
    }));

    const productos = new Map();
    ventas.forEach((pedido) => {
      detallePedidoRepository.findByPedidoId(pedido.id).forEach((detalle) => {
        const actual = productos.get(detalle.nombreProducto) ?? {
          nombre: detalle.nombreProducto,
          unidades: 0,
          monto: 0,
        };
        actual.unidades += detalle.cantidad;
        actual.monto += detalle.subtotal;
        productos.set(detalle.nombreProducto, actual);
      });
    });
    const todosLosProductos = [...productos.values()].sort((a, b) => b.monto - a.monto);

    const porDia = [];
    for (let t = Date.parse(fechaDesde); t <= Date.parse(fechaHasta); t += UN_DIA_MS) {
      const fecha = aFechaIso(new Date(t));
      const delDia = ventas.filter((pedido) => diaLocal(new Date(pedido.fecha)) === fecha);
      porDia.push({ fecha, pedidos: delDia.length, total: delDia.reduce((suma, pedido) => suma + pedido.total, 0) });
    }

    return {
      desde: fechaDesde,
      hasta: fechaHasta,
      cantidadPedidos: ventas.length,
      totalVendido,
      ticketPromedio: ventas.length ? Math.round(totalVendido / ventas.length) : 0,
      unidadesVendidas: todosLosProductos.reduce((suma, producto) => suma + producto.unidades, 0),
      porEstado,
      porProducto: todosLosProductos.slice(0, 10),
      porDia,
    };
  }
}

export default new ReporteService();
