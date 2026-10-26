class Producto {
  constructor(codigo, nombre, categoria, talle, color, descripcion, precio, stock, imagen, activo = true) {
    this.codigo = codigo;
    this.nombre = nombre;
    this.categoria = categoria;
    this.talle = talle;
    this.color = color;
    this.descripcion = descripcion;
    this.precio = precio;
    this.stock = stock;
    this.imagen = imagen;
    this.activo = activo; // false = producto desactivado (no se muestra ni se vende)
  }
}

export default Producto;
