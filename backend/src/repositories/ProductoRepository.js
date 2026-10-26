import MemoryRepository from "./MemoryRepository.js";

class ProductoRepository extends MemoryRepository {
  constructor() {
    super("codigo");
  }

  findByCodigo(codigo) {
    return this.findById(codigo);
  }

  create(producto) {
    return this.save(producto);
  }
}

export default new ProductoRepository();
