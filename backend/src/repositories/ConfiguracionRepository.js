import Configuracion from "../models/Configuracion.js";

// La configuración es un único registro en memoria.
class ConfiguracionRepository {
  #configuracion = new Configuracion(0);

  get() {
    return this.#configuracion;
  }

  update(cambios) {
    Object.assign(this.#configuracion, cambios);
    return this.#configuracion;
  }

  set(configuracion) {
    this.#configuracion = configuracion;
  }
}

export default new ConfiguracionRepository();
