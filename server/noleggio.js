class Noleggio {
  constructor(id, dataInizio, dataFine, utente, auto) {
    if (id) {
      this.id = id;
    }

    this.dataInizio = dataInizio;
    this.dataFine = dataFine;
    this.utente = utente;
    this.auto = auto;
  }

  static from(json) {
    const t = Object.assign(new Noleggio(), json);
    return t;
  }
}

module.exports = Noleggio;
