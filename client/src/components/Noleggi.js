import React, { useState, useEffect, useContext } from "react";
import NoleggioItem from "./NoleggioItem";
import ListGroup from "react-bootstrap/ListGroup";
import moment from "moment";
import { Redirect } from "react-router-dom";
import { OptionalErrorMsg } from "./VariousComponent";
import API from "../api/API";

import { Loading } from "./VariousComponent";
import Card from "react-bootstrap/Card";
import { AuthContext } from "../auth/AuthContext";

function Noleggi() {
  const context = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [noleggi, setNoleggi] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [noleggiPassati, setNoleggiPassati] = useState([]);
  const [noleggiAttivi, setNoleggiAttivi] = useState([]);
  const [noleggiFuturi, setNoleggiFuturi] = useState([]);

  useEffect(() => {
    if (context.authUser && context.authUser.userID)
      API.getUserRentals(context.authUser.userID)
        .then((ns) => {
          setNoleggi(ns);
        })
        .catch((err) => {
          setTimeout(() => context.removeAuthUser(), 1500);
          setErrorMsg(err.errObj.errors[0].msg);
        });
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (noleggi !== undefined) {
      setNoleggiPassati(
        noleggi.filter((n) => n.dataFine < moment().format("YYYY-MM-DD"))
      );
      setNoleggiAttivi(
        noleggi.filter(
          (n) =>
            n.dataFine >= moment().format("YYYY-MM-DD") &&
            n.dataInizio <= moment().format("YYYY-MM-DD")
        )
      );
      setNoleggiFuturi(
        noleggi.filter((n) => n.dataInizio > moment().format("YYYY-MM-DD"))
      );
    } else {
      setNoleggiPassati([]);
      setNoleggiAttivi([]);
      setNoleggiFuturi([]);
    }
  }, [noleggi]);

  const cancelErrorMsg = () => {
    setErrorMsg("");
  };

  if (!context.authUser) return <Redirect to="/login" />;
  return (
    <>
      <OptionalErrorMsg errorMsg={errorMsg} cancelErrorMsg={cancelErrorMsg} />
      {loading && <Loading />}
      {!loading && (
        <>
          <ListGroup>
            <Card>
              <Card.Body>
                <Card.Title>Noleggi futuri:</Card.Title>
                {noleggiFuturi.map((noleggio) => {
                  return (
                    <NoleggioItem
                      type="future"
                      key={noleggio.id}
                      noleggio={noleggio}
                      rimuoviNoleggioDaStato={() =>
                        setNoleggi(noleggi.filter((a) => a.id !== noleggio.id))
                      }
                      setErrorMsg={setErrorMsg}
                    />
                  );
                })}
                {noleggiFuturi.length === 0 &&
                  "Nessun noleggio futuro presente"}
              </Card.Body>
            </Card>
          </ListGroup>
          <hr />
          <ListGroup>
            <Card>
              <Card.Body>
                <Card.Title>Noleggi attivi:</Card.Title>
                {noleggiAttivi.map((noleggio) => {
                  return (
                    <NoleggioItem
                      type="active"
                      key={noleggio.id}
                      noleggio={noleggio}
                    />
                  );
                })}
                {noleggiAttivi.length === 0 &&
                  "Nessun noleggio attivo presente"}
              </Card.Body>
            </Card>
          </ListGroup>
          <hr />
          <ListGroup>
            <Card>
              <Card.Body>
                <Card.Title>Noleggi terminati:</Card.Title>
                {noleggiPassati.map((noleggio) => {
                  return (
                    <NoleggioItem
                      type="old"
                      key={noleggio.id}
                      noleggio={noleggio}
                    />
                  );
                })}
                {noleggiPassati.length === 0 &&
                  "Nessun noleggio terminato presente"}
              </Card.Body>
            </Card>
          </ListGroup>
        </>
      )}
    </>
  );
}

export default Noleggi;
