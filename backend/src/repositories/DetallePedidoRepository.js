import MemoryRepository from "./MemoryRepository.js";

class DetallePedidoRepository extends MemoryRepository {
  findByPedidoId(pedidoId) {
    return this.findMany((detalle) => detalle.pedidoId === pedidoId);
  }
}

export default new DetallePedidoRepository();
