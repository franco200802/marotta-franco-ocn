class ProductoRepository {
  #productos = [];
  #ultimoCodigo = 0;

  findAll() {
    return this.#productos;
  }

  findByCodigo(codigo) {
    return this.#productos.find((producto) => producto.codigo === codigo);
  }

  create(producto) {
    this.#ultimoCodigo += 1;
    producto.codigo = this.#ultimoCodigo;
    this.#productos.push(producto);
    return producto;
  }

  update(codigo, cambios) {
    const index = this.#productos.findIndex((producto) => producto.codigo === codigo);
    if (index === -1) {
      return null;
    }

    this.#productos[index] = { ...this.#productos[index], ...cambios, codigo };
    return this.#productos[index];
  }

  delete(codigo) {
    const index = this.#productos.findIndex((producto) => producto.codigo === codigo);
    if (index === -1) {
      return false;
    }

    this.#productos.splice(index, 1);
    return true;
  }
}

export default new ProductoRepository();
