import MemoryRepository from "./MemoryRepository.js";

class AdministradorRepository extends MemoryRepository {
  findByEmail(email) {
    return this.findOne((administrador) => administrador.email === email);
  }
}

export default new AdministradorRepository();
