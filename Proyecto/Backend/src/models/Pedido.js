class Pedido {
  constructor(id, clienteId, fecha, estado, total) {
    this.id = id;
    this.clienteId = clienteId;
    this.fecha = fecha;
    this.estado = estado; // 'Pendiente' | 'Confirmado' | 'En preparacion' | 'Enviado' | 'Finalizado' | 'Cancelado'
    this.total = total;
  }
}

export default Pedido;
