class Cliente {
  constructor(id, nombre, apellido, email, password, direccion, activo = true) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.password = password;
    this.direccion = direccion;
    this.activo = activo; // el administrador puede desactivar la cuenta (Entrega 4)
  }
}

export default Cliente;
