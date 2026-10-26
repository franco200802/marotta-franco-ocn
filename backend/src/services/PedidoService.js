import Pedido from "../models/Pedido.js";
import DetallePedido from "../models/DetallePedido.js";
import Envio from "../models/Envio.js";
import pedidoRepository from "../repositories/PedidoRepository.js";
import detallePedidoRepository from "../repositories/DetallePedidoRepository.js";
import envioRepository from "../repositories/EnvioRepository.js";
import productoRepository from "../repositories/ProductoRepository.js";
import clienteRepository from "../repositories/ClienteRepository.js";
import envioService from "./EnvioService.js";
import { BadRequestError, ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { Roles } from "../enums/Roles.js";
import { EstadoPedido, TransicionesPedido } from "../enums/EstadoPedido.js";
import { TipoEntrega } from "../enums/TipoEntrega.js";
import { MetodoPago } from "../enums/MetodoPago.js";
import { isNonEmptyString, isOneOf, isPositiveInteger, parseId } from "../utils/validators.js";

const nombreDeVariante = (producto) =>
  [producto.nombre, [producto.talle, producto.color].filter(Boolean).join(", ")].filter(Boolean).join(" · ");

class PedidoService {
  crear(clienteId, datos) {
    const { items, tipoEntrega, zonaId, direccion, metodoPago } = datos ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestError(Messages.CARRITO_VACIO);
    }
    if (!isOneOf(tipoEntrega, TipoEntrega)) {
      throw new BadRequestError(Messages.TIPO_ENTREGA_INVALIDO);
    }
    if (!isOneOf(metodoPago, MetodoPago)) {
      throw new BadRequestError(Messages.METODO_PAGO_INVALIDO);
    }
    if (tipoEntrega === TipoEntrega.DOMICILIO && !isNonEmptyString(direccion)) {
      throw new BadRequestError(Messages.DIRECCION_REQUERIDA);
    }

    // Primero se valida todo; el stock se descuenta solo si cada línea alcanza.
    const lineas = this.#agruparItems(items).map(({ productoId, cantidad }) => {
      const producto = productoRepository.findByCodigo(productoId);
      if (!producto || !producto.activo) {
        throw new ConflictError(Messages.PRODUCTO_NO_DISPONIBLE);
      }
      if (producto.stock < cantidad) {
        throw new ConflictError(Messages.STOCK_INSUFICIENTE); // RN-01
      }
      return { producto, cantidad };
    });

    // RN-05: siempre se cobra el precio vigente del servidor, no el que tenía el carrito.
    const subtotal = lineas.reduce((suma, { producto, cantidad }) => suma + producto.precio * cantidad, 0);
    const cotizacion = envioService.cotizar({ tipoEntrega, zonaId, subtotal });

    const pedido = pedidoRepository.save(
      new Pedido(
        null,
        clienteId,
        new Date().toISOString(),
        EstadoPedido.PENDIENTE,
        subtotal + cotizacion.costo,
        metodoPago,
      ),
    );

    lineas.forEach(({ producto, cantidad }) => {
      producto.stock -= cantidad;
      detallePedidoRepository.save(
        new DetallePedido(
          null,
          pedido.id,
          producto.codigo,
          cantidad,
          producto.precio,
          producto.precio * cantidad,
          nombreDeVariante(producto),
        ),
      );
    });

    envioRepository.save(
      new Envio(
        null,
        pedido.id,
        tipoEntrega,
        cotizacion.zona?.nombre ?? null,
        cotizacion.costo,
        tipoEntrega === TipoEntrega.DOMICILIO ? direccion.trim() : null,
      ),
    );

    return this.#completo(pedido);
  }

  listarDe(clienteId) {
    return pedidoRepository
      .findByClienteId(clienteId)
      .reverse()
      .map((pedido) => this.#completo(pedido));
  }

  listarTodos({ estado } = {}) {
    if (estado !== undefined && !isOneOf(estado, EstadoPedido)) {
      throw new BadRequestError(Messages.ESTADO_INVALIDO);
    }
    return pedidoRepository
      .findAll()
      .filter((pedido) => !estado || pedido.estado === estado)
      .reverse()
      .map((pedido) => this.#completo(pedido, { conCliente: true }));
  }

  obtener(idParam, usuario) {
    const pedido = pedidoRepository.findById(parseId(idParam));
    // Un cliente no puede saber si existe el pedido de otra persona.
    if (!pedido || (usuario.rol !== Roles.ADMIN && pedido.clienteId !== usuario.id)) {
      throw new NotFoundError(Messages.PEDIDO_NOT_FOUND);
    }
    return this.#completo(pedido, { conCliente: usuario.rol === Roles.ADMIN });
  }

  /** Solo el administrador: avanza el pedido por el flujo de estados. */
  cambiarEstado(idParam, estado) {
    if (!isOneOf(estado, EstadoPedido)) {
      throw new BadRequestError(Messages.ESTADO_INVALIDO);
    }
    const pedido = this.#exigir(idParam);
    if (!TransicionesPedido[pedido.estado].includes(estado)) {
      throw new ConflictError(Messages.TRANSICION_INVALIDA);
    }
    if (estado === EstadoPedido.CANCELADO) {
      this.#devolverStock(pedido);
    }
    pedido.estado = estado;
    return this.#completo(pedido, { conCliente: true });
  }

  /** RN-03: el cliente solo cancela un pedido propio en estado Pendiente; se restablece el stock. */
  cancelar(idParam, usuario) {
    this.obtener(idParam, usuario);
    const pedido = this.#exigir(idParam);
    if (pedido.estado !== EstadoPedido.PENDIENTE) {
      throw new ConflictError(Messages.CANCELACION_NO_PERMITIDA);
    }
    this.#devolverStock(pedido);
    pedido.estado = EstadoPedido.CANCELADO;
    return this.#completo(pedido, { conCliente: usuario.rol === Roles.ADMIN });
  }

  #agruparItems(items) {
    const porProducto = new Map();
    items.forEach((item) => {
      const productoId = parseId(item?.productoId);
      if (productoId === null) {
        throw new BadRequestError(Messages.INVALID_DATA);
      }
      if (!isPositiveInteger(item?.cantidad)) {
        throw new BadRequestError(Messages.CANTIDAD_INVALIDA);
      }
      porProducto.set(productoId, (porProducto.get(productoId) ?? 0) + item.cantidad);
    });
    return [...porProducto].map(([productoId, cantidad]) => ({ productoId, cantidad }));
  }

  #exigir(idParam) {
    const pedido = pedidoRepository.findById(parseId(idParam));
    if (!pedido) {
      throw new NotFoundError(Messages.PEDIDO_NOT_FOUND);
    }
    return pedido;
  }

  #devolverStock(pedido) {
    detallePedidoRepository.findByPedidoId(pedido.id).forEach((detalle) => {
      const producto = productoRepository.findByCodigo(detalle.productoId);
      if (producto) {
        producto.stock += detalle.cantidad;
      }
    });
  }

  #completo(pedido, { conCliente = false } = {}) {
    const detalles = detallePedidoRepository.findByPedidoId(pedido.id);
    const envio = envioRepository.findByPedidoId(pedido.id);
    const resultado = {
      ...pedido,
      subtotal: detalles.reduce((suma, detalle) => suma + detalle.subtotal, 0),
      detalles,
      envio,
      siguientesEstados: TransicionesPedido[pedido.estado],
    };
    if (conCliente) {
      const cliente = clienteRepository.findById(pedido.clienteId);
      resultado.cliente = cliente
        ? { id: cliente.id, nombre: cliente.nombre, apellido: cliente.apellido, email: cliente.email }
        : null;
    }
    return resultado;
  }
}

export default new PedidoService();
