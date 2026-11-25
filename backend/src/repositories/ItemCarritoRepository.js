import MemoryRepository from "./MemoryRepository.js";

class ItemCarritoRepository extends MemoryRepository {
  findByClienteId(clienteId) {
    return this.findMany((item) => item.clienteId === clienteId);
  }

  findItem(clienteId, productoId) {
    return this.findOne((item) => item.clienteId === clienteId && item.productoId === productoId);
  }

  deleteByClienteId(clienteId) {
    this.findByClienteId(clienteId).forEach((item) => this.delete(item.id));
  }
}

export default new ItemCarritoRepository();
