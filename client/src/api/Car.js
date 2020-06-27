class Car {
  constructor(id, categoria, marca, modello) {
    if (id) {
      this.id = id;
    }

    this.categoria = categoria;
    this.marca = marca;
    this.modello = modello;
  }

  static from(json) {
    const t = Object.assign(new Car(), json);
    return t;
  }
}

export default Car;
