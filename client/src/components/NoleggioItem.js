import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import { TrashSVG } from "./VariousComponent";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import API from "../api/API";

function NoleggioItem(props) {
  let { noleggio, rimuoviNoleggioDaStato, setErrorMsg } = props;
  let { type } = props;
  let color;
  type === "old"
    ? (color = "secondary")
    : type === "active"
    ? (color = "success")
    : (color = "primary");

  const cancellaNoleggio = (ID) => {
    API.deleteRental(ID)
      .then((response) => {
        rimuoviNoleggioDaStato(ID);
      })
      .catch((err) => setErrorMsg("Problema nella cancellazione del noleggio"));
  };

  return (
    <ListGroup.Item variant={color} id={noleggio.id}>
      <Row className="align-items-center">
        <Col>Marca: {noleggio.marca}</Col>
        <Col>Modello: {noleggio.modello}</Col>
        <Col>
          <Badge variant="info">Categoria: {noleggio.categoria}</Badge>
        </Col>
        <Col>
          {noleggio.dataInizio}
          {"  →  "}
          {noleggio.dataFine}
        </Col>
        {type === "future" && (
          <Button
            variant="outline-info"
            onClick={() => cancellaNoleggio(noleggio.id)}
          >
            <TrashSVG />
          </Button>
        )}
      </Row>
    </ListGroup.Item>
  );
}

export default NoleggioItem;
