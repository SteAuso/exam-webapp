import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Alert from "react-bootstrap/Alert";
import CarItem from "./CarItem";

function CarsList(props) {
  let { cars } = props;
  cars.sort((a, b) => a.marca > b.marca);
  if (cars.length === 0)
    return (
      <Alert variant="warning">
        Nessuna auto soddisfa i requisiti da lei richiesti
      </Alert>
    );
  return (
    <ListGroup as="ul" variant="flush">
      {cars.map((car) => {
        return <CarItem key={car.id} car={car} />;
      })}
    </ListGroup>
  );
}

export default CarsList;
