import MemoryRepository from "./MemoryRepository.js";

class ClienteRepository extends MemoryRepository {
  findByEmail(email) {
    return this.findOne((cliente) => cliente.email === email);
  }
}

export default new ClienteRepository();
