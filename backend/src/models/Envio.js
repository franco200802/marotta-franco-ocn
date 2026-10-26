class Envio {
  constructor(id, pedidoId, tipo, zona, costo, direccion) {
    this.id = id;
    this.pedidoId = pedidoId;
    this.tipo = tipo; // 'retiro_local' | 'domicilio'
    this.zona = zona;
    this.costo = costo;
    this.direccion = direccion; // obligatoria si el tipo es 'domicilio'
  }
}

export default Envio;
