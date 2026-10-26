class Envio {
  constructor(id, pedidoId, tipo, zona, costo) {
    this.id = id;
    this.pedidoId = pedidoId;
    this.tipo = tipo; // 'retiro_local' | 'domicilio'
    this.zona = zona;
    this.costo = costo;
  }
}

export default Envio;
