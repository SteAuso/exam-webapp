import Car from "./Car";
import Noleggio from "./Noleggio";
const baseURL = "/api";

async function isAuthenticated() {
  const response = await fetch(baseURL + "/user");
  const userJson = await response.json();
  if (response.ok) {
    return userJson;
  } else {
    let err = { status: response.status, errObj: userJson };
    throw err;
  }
}

async function getCars() {
  const response = await fetch(baseURL + "/cars");
  const carsJson = await response.json();
  if (response.ok) {
    return carsJson.map((t) => Car.from(t));
  } else {
    let err = { status: response.status, errObj: carsJson };
    throw err;
  }
}

async function userLogin(username, password) {
  return new Promise((resolve, reject) => {
    fetch(baseURL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((user) => {
            resolve(user);
          });
        } else {
          response
            .json()
            .then((obj) => {
              reject(obj);
            })
            .catch((err) => {
              reject({
                errors: [
                  { param: "Application", msg: "Cannot parse server response" },
                ],
              });
            });
        }
      })
      .catch((err) => {
        reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] });
      });
  });
}

async function userLogout() {
  return new Promise((resolve, reject) => {
    fetch(baseURL + "/logout", {
      method: "POST",
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          response
            .json()
            .then((obj) => {
              reject(obj);
            })
            .catch((err) => {
              reject({
                errors: [
                  { param: "Application", msg: "Cannot parse server response" },
                ],
              });
            });
        }
      })
      .catch((err) => {
        reject({ errors: [{ param: "Server", msg: "Cannot Communicate" }] });
      });
  });
}

async function getPriceQuantity(config) {
  return new Promise((resolve, reject) => {
    fetch(baseURL + "/pricequantity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })
      .then((response) => {
        if (response.ok) {
          response
            .json()
            .then((r) => resolve({ price: r.price, quantity: r.number }));
        } else
          response
            .json()
            .then((obj) => {
              reject(obj);
            })
            .catch((err) => {
              reject({
                errors: [
                  { param: "Application", msg: "Cannot parse server response" },
                ],
              });
            });
      })
      .catch((err) => {
        reject({ errors: [{ param: "Server", msg: "Cannot Communicate" }] });
      });
  });
}

async function pay(paymentDetails) {
  return new Promise((resolve, reject) => {
    fetch(baseURL + "/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentDetails),
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((r) => {
            if (r.successo === "si") resolve({ success: true });
            else reject({ success: false });
          });
        } else
          response
            .json()
            .then((obj) => {
              reject(obj);
            })
            .catch((err) => {
              reject({
                errors: [
                  { param: "Application", msg: "Cannot parse server response" },
                ],
              });
            });
      })
      .catch((err) => {
        reject({ errors: [{ param: "Server", msg: "Cannot Communicate" }] });
      });
  });
}

async function addRental(config) {
  return new Promise((resolve, reject) => {
    fetch(baseURL + "/rental", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((r) => {
            if (r.successo === "si") resolve({ success: true });
            else reject({ success: false });
          });
        } else {
          response
            .json()
            .then((obj) => {
              reject(obj);
            })
            .catch((err) => {
              reject({
                errors: [
                  { param: "Application", msg: "Cannot parse server response" },
                ],
              });
            });
        }
      })
      .catch((err) => {
        reject({ errors: [{ param: "Server", msg: "Cannot Communicate" }] });
      });
  });
}

async function getUserRentals(userID) {
  let url = "/users/" + userID + "/rentals";
  const response = await fetch(baseURL + url);
  const noleggiJson = await response.json();

  if (response.ok) {
    if (noleggiJson.noleggi === "empty") return;
    return noleggiJson.map((t) => Noleggio.from(t));
  } else {
    let err = { status: response.status, errObj: noleggiJson };
    throw err;
  }
}

async function deleteRental(rentalID) {
  let url = "/rentals/" + rentalID;
  return new Promise((resolve, reject) => {
    fetch(baseURL + url, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          resolve(null);
        } else {
          response
            .json()
            .then((obj) => {
              reject(obj);
            })
            .catch((err) => {
              reject({
                errors: [
                  { param: "Application", msg: "Cannot parse server response" },
                ],
              });
            });
        }
      })
      .catch((err) => {
        reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] });
      });
  });
}

const API = {
  getCars,
  userLogin,
  userLogout,
  isAuthenticated,
  getPriceQuantity,
  pay,
  addRental,
  getUserRentals,
  deleteRental,
};
export default API;
