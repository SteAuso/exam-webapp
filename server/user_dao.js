"use strict";

const User = require("./user");
const db = require("./db");
const bcrypt = require("bcrypt");
const moment = require("moment");

const createUser = function (row) {
  const id = row.utente_id;
  const name = row.Nome;
  const email = row.mail;
  const hash = row.hash;

  return new User(id, name, email, hash);
};

exports.isUserFrequent = function (id) {
  return new Promise((resolve, reject) => {
    const sql = `SELECT count(*)
                 FROM noleggi
                 WHERE utente = ?
                   AND DataFine < ?
                 GROUP BY utente
                 HAVING count(*) >= 3`;
    db.get(sql, [id, moment().format("YYYY-MM-DD")], (err, row) => {
      if (err) {
        reject(err);
      } else {
        if (row === undefined) resolve(false);
        else resolve(true);
      }
    });
  });
};

exports.getUser = function (email) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM utenti WHERE mail = ?";
    db.all(sql, [email], (err, rows) => {
      if (err) reject(err);
      else if (rows.length === 0) resolve(undefined);
      else {
        const user = createUser(rows[0]);
        resolve(user);
      }
    });
  });
};

exports.getUserId = function (email) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT utente_id FROM utenti WHERE mail = ?";
    db.all(sql, [email], (err, rows) => {
      if (err) reject(err);
      else if (rows.length === 0) resolve(undefined);
      else {
        resolve(rows[0].utente_id);
      }
    });
  });
};

exports.getUserById = function (id) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM utenti WHERE utente_id = ?";
    db.all(sql, [id], (err, rows) => {
      if (err) reject(err);
      else if (rows.length === 0) resolve(undefined);
      else {
        const user = createUser(rows[0]);
        resolve(user);
      }
    });
  });
};

exports.checkPassword = function (user, password) {
  console.log("hash of: " + password);
  let hash = bcrypt.hashSync(password, 10);
  console.log(hash);
  console.log("DONE");

  return bcrypt.compareSync(password, user.hash);
};

exports.loadUserInfo = function (userID) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT utente_id, mail FROM utenti WHERE utente_id = ?";
    db.all(sql, [userID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      if (rows.length === 0) {
        reject(null);
        return;
      }
      resolve({
        userID: rows[0].utente_id,
        email: rows[0].mail,
      });
      return;
    });
  });
};
