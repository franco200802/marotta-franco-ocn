// Una línea del carrito de un cliente: el carrito se guarda en el servidor (Entrega 4).
class ItemCarrito {
  constructor(id, clienteId, productoId, cantidad, precio, nombreProducto) {
    this.id = id;
    this.clienteId = clienteId;
    this.productoId = productoId;
    this.cantidad = cantidad;
    this.precio = precio; // último precio que vio el cliente: si cambia, se le avisa (RN-05)
    this.nombreProducto = nombreProducto; // para avisar si la prenda deja de estar disponible
  }
}

export default ItemCarrito;
