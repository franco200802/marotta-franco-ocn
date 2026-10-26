// Los datos del local son un único registro en memoria.
class LocalRepository {
  #local = null;

  get() {
    return this.#local;
  }

  set(local) {
    this.#local = local;
  }
}

export default new LocalRepository();
