import productoRepository from "../repositories/ProductoRepository.js";
import { BadRequestError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { isPositiveInteger, parseId } from "../utils/validators.js";

class CarritoService {
  /**
   * El carrito vive en el navegador. Antes de confirmar se valida contra el servidor:
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
      const disponible = Boolean(producto?.activo) && producto.stock > 0;
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
}

export default new CarritoService();
