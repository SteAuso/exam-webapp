import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import {
  ConfiguratorSVG,
  LoginSVG,
  LogoutSVG,
  ListSVG,
} from "./VariousComponent";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { useContext } from "react";

function Header(props) {
  let context = useContext(AuthContext);
  return (
    <Navbar bg="info" expand="sm" fixed="top">
      <Navbar.Toggle
        aria-controls="left-sidebar"
        aria-expanded="false"
        aria-label="Toggle sidebar"
        onClick={props.showSidebar}
      />
      <Nav.Link as={NavLink} to="/">
        <Navbar.Brand className="text-white font-weight-bold">
          Noleggio veicoli
        </Navbar.Brand>
      </Nav.Link>
      {!context.authUser && (
        <Nav.Link className="ml-sm-auto" as={NavLink} to="/login">
          <LoginSVG />
        </Nav.Link>
      )}

      {context.authUser && (
        <Nav className="ml-sm-auto">
          <Nav.Link as={NavLink} to="/configurator">
            <ConfiguratorSVG />
          </Nav.Link>
          <Nav.Link as={NavLink} to="/rentals">
            <ListSVG />
          </Nav.Link>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Nav.Link
            as={NavLink}
            onClick={() => {
              context.logoutUser();
            }}
            to="/"
          >
            <LogoutSVG />
          </Nav.Link>
        </Nav>
      )}
    </Navbar>
  );
}

export default Header;
