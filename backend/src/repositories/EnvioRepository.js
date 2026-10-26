import MemoryRepository from "./MemoryRepository.js";

class EnvioRepository extends MemoryRepository {
  findByPedidoId(pedidoId) {
    return this.findOne((envio) => envio.pedidoId === pedidoId);
  }
}

export default new EnvioRepository();
