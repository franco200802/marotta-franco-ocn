/*
 * Validación y conversión de datos del formulario de productos.
 * Respeta las reglas del backend (ProductoService): nombre y categoría obligatorios,
 * precio y stock numéricos mayores o iguales a cero. Además, el stock debe ser entero
 * (Validación 3 del análisis de requerimientos).
 */
export const PRODUCTO_VACIO = {
  nombre: "",
  categoria: "",
  talle: "",
  color: "",
  descripcion: "",
  precio: "",
  stock: "",
  imagen: "",
};

export const LIMITES = {
  nombre: 80,
  categoria: 40,
  talle: 20,
  color: 30,
  descripcion: 500,
};

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validarLongitud(errors, values, campo, etiqueta) {
  if (values[campo].trim().length > LIMITES[campo]) {
    errors[campo] = `${etiqueta} no puede superar los ${LIMITES[campo]} caracteres.`;
  }
}

export function validateProducto(values) {
  const errors = {};

  if (!values.nombre.trim()) errors.nombre = "Ingresá el nombre del producto.";
  else validarLongitud(errors, values, "nombre", "El nombre");

  if (!values.categoria.trim()) errors.categoria = "Ingresá la categoría.";
  else validarLongitud(errors, values, "categoria", "La categoría");

  validarLongitud(errors, values, "talle", "El talle");
  validarLongitud(errors, values, "color", "El color");
  validarLongitud(errors, values, "descripcion", "La descripción");

  const precio = String(values.precio).trim();
  if (!precio) errors.precio = "Ingresá el precio.";
  else if (!Number.isFinite(Number(precio)) || Number(precio) < 0) {
    errors.precio = "El precio debe ser un número mayor o igual a 0.";
  }

  const stock = String(values.stock).trim();
  if (!stock) errors.stock = "Ingresá el stock disponible.";
  else if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    errors.stock = "El stock debe ser un número entero mayor o igual a 0.";
  }

  const imagen = values.imagen.trim();
  if (imagen && !isValidHttpUrl(imagen)) {
    errors.imagen = "Ingresá una URL válida que comience con http:// o https://.";
  }

  return errors;
}

/** Convierte los valores del formulario al cuerpo esperado por la API. */
export function toProductoPayload(values) {
  return {
    nombre: values.nombre.trim(),
    categoria: values.categoria.trim(),
    talle: values.talle.trim(),
    color: values.color.trim(),
    descripcion: values.descripcion.trim(),
    precio: Number(values.precio),
    stock: Number(values.stock),
    imagen: values.imagen.trim(),
  };
}

/** Convierte un producto recibido de la API en valores editables. */
export function productoToFormValues(producto) {
  return Object.fromEntries(
    Object.keys(PRODUCTO_VACIO).map((campo) => [campo, producto?.[campo] == null ? "" : String(producto[campo])]),
  );
}
