import localRepository from "../repositories/LocalRepository.js";

class LocalService {
  obtener() {
    return localRepository.get();
  }
}

export default new LocalService();
