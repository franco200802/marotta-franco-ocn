class Pedido {
  constructor(id, clienteId, fecha, estado, total, metodoPago) {
    this.id = id;
    this.clienteId = clienteId;
    this.fecha = fecha;
    this.estado = estado; // 'Pendiente' | 'Confirmado' | 'En preparacion' | 'Enviado' | 'Finalizado' | 'Cancelado'
    this.total = total;
    this.metodoPago = metodoPago; // 'efectivo' | 'transferencia' | 'mercado_pago' (se paga al retirar o recibir)
  }
}

export default Pedido;
