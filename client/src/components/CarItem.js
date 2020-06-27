import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Badge from "react-bootstrap/Badge";

function CarItem(props) {
  let { car } = props;
  return (
    <ListGroup.Item id={car.id}>
      <Row>
        <Col>{car.marca}</Col>
        <Col className="text-center font-italic">{car.modello}</Col>
        <Col className="text-right font-weight-bold">
          Categoria: &nbsp;
          <Badge variant="info">{car.categoria}</Badge>
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

export default CarItem;
