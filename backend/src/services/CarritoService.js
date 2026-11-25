import ItemCarrito from "../models/ItemCarrito.js";
import productoRepository from "../repositories/ProductoRepository.js";
import itemCarritoRepository from "../repositories/ItemCarritoRepository.js";
import clienteService from "./ClienteService.js";
import { BadRequestError, ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { nombreDeVariante } from "../utils/mappers.js";
import { isPositiveInteger, parseId } from "../utils/validators.js";

const estaDisponible = (producto) => Boolean(producto?.activo) && producto.stock > 0;

class CarritoService {
  /**
   * Visitantes: el carrito vive en el navegador y se valida contra el servidor antes de comprar.
   * RN-05 (precio actualizado) y RN-01 / Validación 3 (cantidad entera, mayor que cero y sin superar el stock).
   */
  validar(items) {
    if (!Array.isArray(items)) {
      throw new BadRequestError(Messages.INVALID_DATA);
    }

    const lineas = items.map((item) => {
      const productoId = parseId(item?.productoId);
      const cantidad = item?.cantidad;
      const producto = productoId !== null ? productoRepository.findByCodigo(productoId) : null;
      const disponible = estaDisponible(producto);
      const precioVisto = typeof item?.precio === "number" ? item.precio : null;

      return {
        productoId,
        cantidad,
        disponible,
        producto: producto?.activo ? producto : null,
        precioActual: producto?.precio ?? null,
        precioCambio: Boolean(producto && precioVisto !== null && precioVisto !== producto.precio),
        stock: producto?.activo ? producto.stock : 0,
        cantidadValida: disponible && isPositiveInteger(cantidad) && cantidad <= producto.stock,
        subtotal: disponible && isPositiveInteger(cantidad) ? producto.precio * cantidad : 0,
      };
    });

    return {
      items: lineas,
      subtotal: lineas.reduce((suma, linea) => suma + linea.subtotal, 0),
      hayCambios: lineas.some((linea) => linea.precioCambio || !linea.cantidadValida),
    };
  }

  /*
   * Clientes con sesión: el carrito se guarda en el servidor y se conserva hasta comprar o vaciarlo.
   * Cada lectura aplica las reglas de negocio y devuelve qué cambió desde la última vez:
   *   RN-05: precio actualizado (se avisa una vez y se guarda el nuevo precio).
   *   RN-01: si una prenda se quedó sin stock se quita; si hay menos unidades, se ajusta la cantidad.
   */
  obtener(clienteId) {
    clienteService.exigirActivo(clienteId);
    const quitados = [];
    const items = [];

    itemCarritoRepository.findByClienteId(clienteId).forEach((item) => {
      const producto = productoRepository.findByCodigo(item.productoId);
      if (!estaDisponible(producto)) {
        itemCarritoRepository.delete(item.id);
        quitados.push({ productoId: item.productoId, nombre: item.nombreProducto });
        return;
      }

      const precioCambio = item.precio !== producto.precio;
      const cantidadAjustada = item.cantidad > producto.stock;
      const cantidad = Math.min(item.cantidad, producto.stock);
      itemCarritoRepository.update(item.id, {
        precio: producto.precio,
        cantidad,
        nombreProducto: nombreDeVariante(producto),
      });

      items.push({
        productoId: producto.codigo,
        cantidad,
        producto,
        precioActual: producto.precio,
        precioCambio,
        cantidadAjustada,
        stock: producto.stock,
        subtotal: producto.precio * cantidad,
      });
    });

    return {
      items,
      quitados,
      cantidadTotal: items.reduce((suma, item) => suma + item.cantidad, 0),
      subtotal: items.reduce((suma, item) => suma + item.subtotal, 0),
      hayCambios: quitados.length > 0 || items.some((item) => item.precioCambio || item.cantidadAjustada),
    };
  }

  /** Suma unidades de una prenda. Validación 3 y RN-01: entero mayor que cero y sin superar el stock. */
  agregar(clienteId, datos) {
    clienteService.exigirActivo(clienteId);
    const productoId = parseId(datos?.productoId);
    const cantidad = datos?.cantidad ?? 1;
    if (productoId === null) {
      throw new BadRequestError(Messages.INVALID_DATA);
    }
    if (!isPositiveInteger(cantidad)) {
      throw new BadRequestError(Messages.CANTIDAD_INVALIDA);
    }

    const producto = this.#exigirProducto(productoId);
    const existente = itemCarritoRepository.findItem(clienteId, productoId);
    const total = (existente?.cantidad ?? 0) + cantidad;
    if (total > producto.stock) {
      throw new ConflictError(existente ? Messages.STOCK_CARRITO_SUPERADO : Messages.STOCK_INSUFICIENTE);
    }

    if (existente) {
      itemCarritoRepository.update(existente.id, { cantidad: total, precio: producto.precio });
    } else {
      itemCarritoRepository.save(
        new ItemCarrito(null, clienteId, productoId, total, producto.precio, nombreDeVariante(producto)),
      );
    }
    return this.obtener(clienteId);
  }

  /** Cambia la cantidad de una prenda que ya está en el carrito. */
  actualizarCantidad(clienteId, productoIdParam, cantidad) {
    clienteService.exigirActivo(clienteId);
    const item = this.#exigirItem(clienteId, productoIdParam);
    if (!isPositiveInteger(cantidad)) {
      throw new BadRequestError(Messages.CANTIDAD_INVALIDA);
    }
    const producto = this.#exigirProducto(item.productoId);
    if (cantidad > producto.stock) {
      throw new ConflictError(Messages.STOCK_INSUFICIENTE);
    }
    itemCarritoRepository.update(item.id, { cantidad });
    return this.obtener(clienteId);
  }

  quitar(clienteId, productoIdParam) {
    clienteService.exigirActivo(clienteId);
    const item = this.#exigirItem(clienteId, productoIdParam);
    itemCarritoRepository.delete(item.id);
    return this.obtener(clienteId);
  }

  vaciar(clienteId) {
    clienteService.exigirActivo(clienteId);
    itemCarritoRepository.deleteByClienteId(clienteId);
    return this.obtener(clienteId);
  }

  /**
   * Al iniciar sesión se suma lo que el visitante tenía en el navegador.
   * Lo que no tiene stock se omite y las cantidades se recortan al stock disponible.
   */
  fusionar(clienteId, items) {
    clienteService.exigirActivo(clienteId);
    if (!Array.isArray(items)) {
      throw new BadRequestError(Messages.INVALID_DATA);
    }
    items.forEach((dato) => {
      const productoId = parseId(dato?.productoId);
      const producto = productoId !== null ? productoRepository.findByCodigo(productoId) : null;
      if (!isPositiveInteger(dato?.cantidad) || !estaDisponible(producto)) return;

      const existente = itemCarritoRepository.findItem(clienteId, productoId);
      const cantidad = Math.min(producto.stock, (existente?.cantidad ?? 0) + dato.cantidad);
      if (existente) {
        itemCarritoRepository.update(existente.id, { cantidad });
      } else {
        itemCarritoRepository.save(
          new ItemCarrito(null, clienteId, productoId, cantidad, producto.precio, nombreDeVariante(producto)),
        );
      }
    });
    return this.obtener(clienteId);
  }

  /** Para confirmar la compra con lo que el cliente tiene guardado. */
  itemsParaPedido(clienteId) {
    return itemCarritoRepository
      .findByClienteId(clienteId)
      .map(({ productoId, cantidad }) => ({ productoId, cantidad }));
  }

  /** Después de comprar, las prendas compradas salen del carrito. */
  quitarComprados(clienteId, productoIds) {
    productoIds.forEach((productoId) => {
      const item = itemCarritoRepository.findItem(clienteId, productoId);
      if (item) itemCarritoRepository.delete(item.id);
    });
  }

  #exigirProducto(productoId) {
    const producto = productoRepository.findByCodigo(productoId);
    if (!producto || !producto.activo) {
      throw new NotFoundError(Messages.PRODUCTO_NOT_FOUND);
    }
    if (producto.stock === 0) {
      throw new ConflictError(Messages.STOCK_INSUFICIENTE); // RN-01
    }
    return producto;
  }

  #exigirItem(clienteId, productoIdParam) {
    const productoId = parseId(productoIdParam);
    const item = productoId !== null ? itemCarritoRepository.findItem(clienteId, productoId) : null;
    if (!item) {
      throw new NotFoundError(Messages.ITEM_CARRITO_NOT_FOUND);
    }
    return item;
  }
}

export default new CarritoService();
