import MemoryRepository from "./MemoryRepository.js";

class PedidoRepository extends MemoryRepository {
  findByClienteId(clienteId) {
    return this.findMany((pedido) => pedido.clienteId === clienteId);
  }
}

export default new PedidoRepository();
