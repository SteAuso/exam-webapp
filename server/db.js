"use strict";
const DBSOURCE = "./db/data.db";

const sqlite = require("sqlite3");
const db = new sqlite.Database(DBSOURCE, (err) => {
  if (err) throw err;
});

module.exports = db;
