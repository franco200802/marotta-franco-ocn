import productoRepository from "../repositories/ProductoRepository.js";
import Producto from "../models/Producto.js";
import { BadRequestError, ConflictError, NotFoundError } from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import {
  isHttpUrl,
  isNonEmptyString,
  isNonNegativeInteger,
  isPositiveNumber,
  normalizeKey,
  optionalString,
  parseId,
} from "../utils/validators.js";

const CAMPOS_EDITABLES = [
  "nombre",
  "categoria",
  "talle",
  "color",
  "descripcion",
  "precio",
  "stock",
  "imagen",
  "activo",
];

class ProductoService {
  /** Público: solo productos activos. El administrador puede pedir también los desactivados. */
  obtenerTodos({ incluirInactivos = false } = {}) {
    const productos = productoRepository.findAll();
    return incluirInactivos ? productos : productos.filter((producto) => producto.activo);
  }

  obtenerPorCodigo(codigoParam, { incluirInactivos = false } = {}) {
    const codigo = parseId(codigoParam);
    const producto = codigo !== null ? productoRepository.findByCodigo(codigo) : null;

    if (!producto || (!producto.activo && !incluirInactivos)) {
      throw new NotFoundError(Messages.PRODUCTO_NOT_FOUND);
    }

    return producto;
  }

  crear(datos) {
    const producto = this.#validar(datos);
    this.#verificarDuplicado(producto);
    return productoRepository.create(
      new Producto(
        null,
        producto.nombre,
        producto.categoria,
        producto.talle,
        producto.color,
        producto.descripcion,
        producto.precio,
        producto.stock,
        producto.imagen,
        producto.activo,
      ),
    );
  }

  actualizar(codigoParam, cambios) {
    const actual = this.obtenerPorCodigo(codigoParam, { incluirInactivos: true });
    const permitidos = Object.fromEntries(
      Object.entries(cambios ?? {}).filter(([campo]) => CAMPOS_EDITABLES.includes(campo)),
    );
    const producto = this.#validar({ ...actual, ...permitidos });
    this.#verificarDuplicado(producto, actual.codigo);
    return productoRepository.update(actual.codigo, producto);
  }

  eliminar(codigoParam) {
    const producto = this.obtenerPorCodigo(codigoParam, { incluirInactivos: true });
    productoRepository.delete(producto.codigo);
  }

  /** Categorías derivadas de los productos activos (la categoría es un texto del producto). */
  obtenerCategorias() {
    const categorias = new Map();
    this.obtenerTodos().forEach(({ categoria }) => {
      const clave = normalizeKey(categoria);
      const actual = categorias.get(clave) ?? { nombre: categoria, cantidad: 0 };
      actual.cantidad += 1;
      categorias.set(clave, actual);
    });
    return [...categorias.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }

  #validar(datos) {
    const { nombre, categoria, precio, stock, imagen, activo } = datos ?? {};

    if (!isNonEmptyString(nombre) || !isNonEmptyString(categoria)) {
      throw new BadRequestError(Messages.PRODUCTO_CAMPOS_OBLIGATORIOS);
    }
    if (!isPositiveNumber(precio)) {
      throw new BadRequestError(Messages.PRODUCTO_PRECIO_INVALIDO);
    }
    if (!isNonNegativeInteger(stock)) {
      throw new BadRequestError(Messages.PRODUCTO_STOCK_INVALIDO);
    }
    if (optionalString(imagen) && !isHttpUrl(imagen.trim())) {
      throw new BadRequestError(Messages.PRODUCTO_IMAGEN_INVALIDA);
    }
    if (activo !== undefined && typeof activo !== "boolean") {
      throw new BadRequestError(Messages.INVALID_DATA);
    }

    return {
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      talle: optionalString(datos.talle),
      color: optionalString(datos.color),
      descripcion: optionalString(datos.descripcion),
      precio,
      stock,
      imagen: optionalString(imagen),
      activo: activo ?? true,
    };
  }

  #verificarDuplicado({ nombre, talle, color }, codigoActual = null) {
    const clave = [nombre, talle, color].map(normalizeKey).join("|");
    const duplicado = productoRepository.findOne(
      (producto) =>
        producto.codigo !== codigoActual &&
        [producto.nombre, producto.talle, producto.color].map(normalizeKey).join("|") === clave,
    );
    if (duplicado) {
      throw new ConflictError(Messages.PRODUCTO_DUPLICADO);
    }
  }
}

export default new ProductoService();
