// Persistencia temporal: cada repositorio guarda sus registros en un array en memoria.
class MemoryRepository {
  #items = [];
  #ultimoId = 0;
  #idField;

  constructor(idField = "id") {
    this.#idField = idField;
  }

  findAll() {
    return [...this.#items];
  }

  findById(id) {
    return this.#items.find((item) => item[this.#idField] === id) ?? null;
  }

  findOne(predicate) {
    return this.#items.find(predicate) ?? null;
  }

  findMany(predicate) {
    return this.#items.filter(predicate);
  }

  save(entity) {
    this.#ultimoId += 1;
    entity[this.#idField] = this.#ultimoId;
    this.#items.push(entity);
    return entity;
  }

  update(id, changes) {
    const entity = this.findById(id);
    if (!entity) {
      return null;
    }
    return Object.assign(entity, changes, { [this.#idField]: id });
  }

  delete(id) {
    const index = this.#items.findIndex((item) => item[this.#idField] === id);
    if (index === -1) {
      return false;
    }
    this.#items.splice(index, 1);
    return true;
  }

  clear() {
    this.#items = [];
    this.#ultimoId = 0;
  }
}

export default MemoryRepository;
