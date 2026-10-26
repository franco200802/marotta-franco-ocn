class DetallePedido {
  constructor(id, pedidoId, productoId, cantidad, precioUnitario, subtotal, nombreProducto) {
    this.id = id;
    this.pedidoId = pedidoId;
    this.productoId = productoId;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.subtotal = subtotal;
    this.nombreProducto = nombreProducto; // copia del nombre al momento de la compra
  }
}

export default DetallePedido;
