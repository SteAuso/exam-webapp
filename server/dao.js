"use strict";

const db = require("./db");
const Car = require("./car");
const Noleggio = require("./noleggio");
const moment = require("moment");

const createNoleggio = function (row) {
  return new Noleggio(
    row.id_noleggio,
    row.DataInizio,
    row.DataFine,
    row.utente,
    row.auto
  );
};

exports.listCars = function () {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM auto";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const cars = rows.map(
        (c) => new Car(c.auto_id, c.categoria, c.marca, c.modello)
      );
      resolve(cars);
    });
  });
};

exports.getCountAutoCategoria = function (category) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT count(*) AS TotAutoCat FROM auto WHERE categoria = ?";
    db.get(sql, [category], (err, row) => {
      if (err) reject(err);
      else resolve(row.TotAutoCat);
    });
  });
};

exports.getAvaiableForCategory = function (conf) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT count(*) AS AutoDisponibili
                 FROM auto
                 WHERE categoria=?
                 AND auto_id NOT IN (
                   SELECT auto
                   FROM noleggi
                   WHERE (DataFine <= ? AND DataInizio >= ?)
                     OR (DataFine >= ? AND DataInizio <= ?)
                     OR (DataFine >= ? AND DataInizio <= ?))`;
    db.get(
      sql,
      [
        conf.categoria,
        conf.dataFine,
        conf.dataInizio,
        conf.dataFine,
        conf.dataFine,
        conf.dataInizio,
        conf.dataInizio,
      ],
      (err, row) => {
        if (err) reject(err);
        else resolve(row.AutoDisponibili);
      }
    );
  });
};

exports.getAvaiableAuto = function (conf) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT auto_id AS id
                 FROM auto
                 WHERE categoria=?
                 AND auto_id NOT IN (
                   SELECT auto
                   FROM noleggi
                   WHERE (DataFine <= ? AND DataInizio >= ?)
                     OR (DataFine >= ? AND DataInizio <= ?)
                     OR (DataFine >= ? AND DataInizio <= ?))`;
    db.get(
      sql,
      [
        conf.categoria,
        conf.dataFine,
        conf.dataInizio,
        conf.dataFine,
        conf.dataFine,
        conf.dataInizio,
        conf.dataInizio,
      ],
      (err, row) => {
        if (err) reject(err);
        else if (row) resolve(row.id);
        else reject(null);
      }
    );
  });
};

exports.getNoleggi = function (userID) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT a.categoria AS categoria, a.marca AS marca, a.modello AS modello,
                 n.DataInizio AS dataInizio, n.DataFine AS dataFine, n.id_noleggio AS id
                 FROM noleggi as n, auto as a
                 WHERE n.auto = a.auto_id
                 AND n.utente = ?`;
    db.all(sql, [userID], (err, rows) => {
      if (err) reject(err);
      else if (rows.length === 0) resolve(undefined);
      else {
        resolve(rows);
      }
    });
  });
};

exports.checkNoleggioUser = function (noleggioID, userID) {
  const oggi = moment().format("YYYY-MM-DD");
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT count(*) AS presente FROM noleggi WHERE id_noleggio = ? AND utente = ? AND DataInizio > ?";
    db.get(sql, [noleggioID, userID, oggi], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

exports.inserisciNoleggio = function (conf, userID, autoID) {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO noleggi(DataInizio, DataFine, utente, auto) VALUES(?,?,?,?)";
    db.run(sql, [conf.dataInizio, conf.dataFine, userID, autoID], function (
      err
    ) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

exports.deleteRental = function (ID) {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM noleggi WHERE id_noleggio=?";
    db.run(sql, [ID], (err) => {
      if (err) reject(err);
      else resolve(null);
    });
  });
};
