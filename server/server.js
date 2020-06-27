"use strict";
const express = require("express");
const morgan = require("morgan");
const jwt = require("express-jwt");
const cookieParser = require("cookie-parser");
const jsonwebtoken = require("jsonwebtoken");
const moment = require("moment");
const validator = require("validator");
const dao = require("./dao.js");
const userDao = require("./user_dao");

const jwtSecret =
  "6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX";
const expireTime = 300; //seconds
// Authorization error
const authErrorObj = {
  errors: [{ param: "Server", msg: "Authorization error" }],
};
// DB error
const dbErrorObj = { errors: [{ param: "Server", msg: "Database error" }] };

// Create application
const app = express();
const PORT = 3001;

// Set-up logging
app.use(morgan("tiny"));

// Process body content
app.use(express.json());

// To parse cookie
app.use(cookieParser());

// Activate server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}/`)
);

/************************/

const prezziCategoria = [
  ["A", 80],
  ["B", 70],
  ["C", 60],
  ["D", 50],
  ["E", 40],
];

// Authentication endpoint
app.post("/api/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  validator.isEmail(username)
    ? null
    : res.status(404).send({
        errors: [{ param: "Server", msg: "Invalid e-mail" }],
      });
  userDao
    .getUser(username)
    .then((user) => {
      if (user === undefined) {
        res.status(404).send({
          errors: [{ param: "Server", msg: "Invalid e-mail" }],
        });
      } else {
        if (!userDao.checkPassword(user, password)) {
          res.status(401).send({
            errors: [{ param: "Server", msg: "Wrong password" }],
          });
        } else {
          //AUTHENTICATION SUCCESS
          const token = jsonwebtoken.sign({ user: user.id }, jwtSecret, {
            expiresIn: expireTime,
          });
          res.cookie("token", token, {
            httpOnly: true,
            sameSite: true,
            maxAge: 1000 * expireTime,
          });
          res.json({ userID: user.id, email: user.email });
        }
      }
    })
    .catch((err) => {
      new Promise((resolve) => {
        setTimeout(resolve, 1000);
      }).then(() => res.status(401).json(authErrorObj));
    });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token").end();
});

app.get("/api/cars", (req, res) => {
  dao
    .listCars()
    .then((cars) => res.json(cars))
    .catch((err) => res.status(500).json(dbErrorObj));
});

// For the rest of the code, all APIs require authentication
app.use(
  jwt({
    secret: jwtSecret,
    getToken: (req) => req.cookies.token,
  })
);

// To return a better object in case of errors
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json(authErrorObj);
  }
});

app.get("/api/user", (req, res) => {
  if (!(req.user && req.user.user))
    res.status(404).send({
      errors: [{ param: "Server", msg: "Invalid user" }],
    });
  const userID = req.user && req.user.user;
  userDao
    .loadUserInfo(userID)
    .then((userObj) => {
      res.json(userObj);
    })
    .catch((err) => res.status(503).json(dbErrorObj));
});

app.get("/api/users/:userID/rentals", (req, res) => {
  const userID = req.user && req.user.user;
  if (userID != req.params.userID) {
    // Controllo che l'utente non mi cerchi di fregare chiedendomi di visualizzare qualcosa di non suo
    res.status(401).end();
  } else {
    dao
      .getNoleggi(userID)
      .then((noleggi) => {
        res.json(noleggi || { noleggi: "empty" });
      })
      .catch((err) => {
        res.status(500).json({ errors: [{ msg: err }] });
      });
  }
});

const calcolaPrezzo = (
  conf,
  CountAutoCategoria,
  AvaiableForCategory,
  frequent
) => {
  const mappa = new Map(prezziCategoria);
  let price = mappa.get(conf.categoria);
  if (conf.chilometri === "tra 50km e 150km") price *= 1;
  else if (conf.chilometri === "meno di 50km") price *= 0.95;
  //se l'utente è malevolo e prova a modificare mandando al server una stringa sconosciuta, quindi non fa match con niente, viene assegnato a "illimitati"
  else price *= 1.05;
  conf.etaGuidatore < 25 ? (price *= 1.05) : null;
  conf.etaGuidatore > 65 ? (price *= 1.1) : null;
  conf.numeroGuidatoriAggiuntivi != 0 ? (price *= 1.15) : null;
  conf.assicurazione ? (price *= 1.2) : null;
  AvaiableForCategory / CountAutoCategoria < 0.1 ? (price *= 1.1) : null;
  frequent ? (price *= 0.9) : null;

  const start = moment(conf.dataInizio, "YYYY-MM-DD");
  const end = moment(conf.dataFine, "YYYY-MM-DD");

  const totDays = end.diff(start, "days") + 1;
  price = price * totDays;
  price = price.toFixed(2);
  return price;
};

app.post("/api/pricequantity", (req, res) => {
  const conf = req.body;
  if (!(req.user && req.user.user))
    res.status(404).send({
      errors: [{ param: "Server", msg: "Invalid user" }],
    });
  const userID = req.user && req.user.user;

  // VALIDAZIONE con "validator"
  let val = validator.isDate(conf.dataInizio, "YYYY-MM-DD");
  val = val && validator.isDate(conf.dataFine, "YYYY-MM-DD");
  val = val && conf.dataInizio <= conf.dataFine;
  val = val && conf.dataInizio >= moment().format("YYYY-MM-DD");
  val = val && ["A", "B", "C", "D", "E"].includes(conf.categoria);
  val = val && validator.isBoolean(conf.assicurazione.toString());
  val = val && validator.isNumeric(conf.etaGuidatore.toString());
  val = val && conf.etaGuidatore >= 18;
  val = val && conf.etaGuidatore <= 110;
  val = val && validator.isNumeric(conf.numeroGuidatoriAggiuntivi.toString());
  console.log("Richiesta prezzo validata correttamente? " + val);

  if (!conf || !val) res.status(400).end();
  else {
    let CountAutoCategoria = dao.getCountAutoCategoria(conf.categoria);
    let AvaiableForCategory = dao.getAvaiableForCategory(conf);
    const isFrequent = userDao.isUserFrequent(userID);

    Promise.all([CountAutoCategoria, AvaiableForCategory, isFrequent])
      .then((values) => {
        const price = calcolaPrezzo(conf, values[0], values[1], values[2]);
        res.status(201).json({ price: price, number: values[1] });
      })
      .catch((err) => {
        res.status(500).json({ errors: [{ param: "Server", msg: err }] });
      });
  }
});

app.post("/api/payment", (req, res) => {
  const paymentDetails = req.body;
  if (!(req.user && req.user.user))
    res.status(404).send({
      errors: [{ param: "Server", msg: "Invalid user" }],
    });
  if (
    paymentDetails.nomeCompleto != "" &&
    paymentDetails.numeroCarta != "" &&
    paymentDetails.cvv != "" &&
    paymentDetails.price != ""
  )
    res.status(201).json({ successo: "si" });
  else res.status(400).json({ successo: "no" });
});

app.post("/api/rental", (req, res) => {
  const conf = req.body;
  if (!(req.user && req.user.user))
    res.status(404).send({
      errors: [{ param: "Server", msg: "Invalid user" }],
    });
  const userID = req.user && req.user.user;

  // alcune cose che il client manda non vengono usate, vengono lasciate se si volessero inserire nel db, non le ho inserite per ridurre la complessità dato che non servivano
  let val = validator.isDate(conf.dataInizio, "YYYY-MM-DD");
  val = val && validator.isDate(conf.dataFine, "YYYY-MM-DD");
  val = val && conf.dataInizio <= conf.dataFine;
  val = val && conf.dataInizio >= moment().format("YYYY-MM-DD");
  val = val && ["A", "B", "C", "D", "E"].includes(conf.categoria);
  val = val && validator.isBoolean(conf.assicurazione.toString());
  val = val && validator.isNumeric(conf.etaGuidatore.toString());
  val = val && conf.etaGuidatore >= 18;
  val = val && conf.etaGuidatore <= 110;
  val = val && validator.isNumeric(conf.numeroGuidatoriAggiuntivi.toString());
  console.log("Richiesta pagamento validata correttamente? " + val);

  if (!conf || !val) res.status(400).end();
  else {
    let AvaiableForCategory = dao.getAvaiableForCategory(conf);
    let AvaiableAuto = dao.getAvaiableAuto(conf);

    Promise.all([AvaiableForCategory, AvaiableAuto])
      .then((values) => {
        if (values[0] > 0)
          dao
            .inserisciNoleggio(conf, userID, values[1])
            .then((r) => res.status(201).json({ successo: "si" }))
            .catch((err) => res.status(400).json({ successo: "no" }));
        else res.status(400).end().json({ successo: "no" });
      })
      .catch((err) => {
        res.status(500).json({
          errors: [
            {
              param: "Server",
              msg: err || "Impossibile completare l'operazione",
            },
          ],
        });
      });
  }
});

// OPPURE /api/users/:userID/rentals/:rentalID
app.delete("/api/rentals/:rentalID", (req, res) => {
  // faccio il check se il noleggio è posseduto dall'utente
  const noleggio = req.params.rentalID;
  const user = req.user && req.user.user;
  dao
    .checkNoleggioUser(noleggio, user)
    .then((r) => {
      if (r.presente === 0) res.status(401).end();
      else {
        dao.deleteRental(noleggio);
        res.status(204).end();
      }
    })
    .catch((err) => {
      res.status(500).json({ errors: [{ param: "Server", msg: err }] });
    });
});
