import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { NavLink } from "react-router-dom";

function Sidebar(props) {
  function CreateCategoria(props) {
    return (
      <NavLink key={`#$props.cat`} to="/">
        <ListGroup.Item
          action
          active={props.activeFilter.includes(props.cat) ? true : false}
          id="filter-all"
          onClick={() => props.swapFilter(props.cat)}
        >
          {props.cat}
        </ListGroup.Item>
      </NavLink>
    );
  }

  function CreateMarche(marca) {
    return (
      <NavLink key={`#${marca}`} to="/">
        <ListGroup.Item
          action
          active={props.activeFilter.includes(marca) ? true : false}
          id="filter-all"
          onClick={() => props.swapFilter(marca)}
        >
          {marca}
        </ListGroup.Item>
      </NavLink>
    );
  }

  return (
    <ListGroup variant="flush below-nav">
      <ListGroup.Item className="p-3 list-title">Categoria</ListGroup.Item>

      <CreateCategoria
        cat="A"
        activeFilter={props.activeFilter}
        swapFilter={props.swapFilter}
      />
      <CreateCategoria
        cat="B"
        activeFilter={props.activeFilter}
        swapFilter={props.swapFilter}
      />
      <CreateCategoria
        cat="C"
        activeFilter={props.activeFilter}
        swapFilter={props.swapFilter}
      />
      <CreateCategoria
        cat="D"
        activeFilter={props.activeFilter}
        swapFilter={props.swapFilter}
      />
      <CreateCategoria
        cat="E"
        activeFilter={props.activeFilter}
        swapFilter={props.swapFilter}
      />

      <ListGroup.Item className="p-3 mt-5 list-title">Marca</ListGroup.Item>
      {props.marche.map(CreateMarche)}
    </ListGroup>
  );
}

export default Sidebar;
