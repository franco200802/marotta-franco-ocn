import productoRepository from "../repositories/ProductoRepository.js";
import Producto from "../models/Producto.js";
import { BadRequestError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { isNonEmptyString, isPositiveNumber, parseId } from "../utils/validators.js";

class ProductoService {
  obtenerTodos() {
    return productoRepository.findAll();
  }

  obtenerPorCodigo(codigoParam) {
    const codigo = parseId(codigoParam);
    const producto = codigo !== null ? productoRepository.findByCodigo(codigo) : undefined;

    if (!producto) {
      throw new NotFoundError(Messages.PRODUCTO_NOT_FOUND);
    }

    return producto;
  }

  crear(datos) {
    const { nombre, categoria, talle, color, descripcion, precio, stock, imagen } = datos;

    if (!isNonEmptyString(nombre) || !isNonEmptyString(categoria) || !isPositiveNumber(precio) || !isPositiveNumber(stock)) {
      throw new BadRequestError(Messages.INVALID_DATA);
    }

    const producto = new Producto(null, nombre, categoria, talle, color, descripcion, precio, stock, imagen);
    return productoRepository.create(producto);
  }

  actualizar(codigoParam, cambios) {
    const producto = this.obtenerPorCodigo(codigoParam);

    if (cambios.precio !== undefined && !isPositiveNumber(cambios.precio)) {
      throw new BadRequestError(Messages.INVALID_DATA);
    }

    if (cambios.stock !== undefined && !isPositiveNumber(cambios.stock)) {
      throw new BadRequestError(Messages.INVALID_DATA);
    }

    return productoRepository.update(producto.codigo, cambios);
  }

  eliminar(codigoParam) {
    const producto = this.obtenerPorCodigo(codigoParam);
    productoRepository.delete(producto.codigo);
  }
}

export default new ProductoService();
