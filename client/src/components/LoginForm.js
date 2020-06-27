import React, { useState, useContext } from "react";
import { BlackLoginSVG } from "./VariousComponent";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Jumbotron from "react-bootstrap/Jumbotron";
import { Redirect } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event, onLogin) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) form.reportValidity();
    else {
      onLogin(username, password);
      setSubmitted(true);
    }
  };

  let context = useContext(AuthContext);
  if (submitted) return <Redirect to="/configurator" />;
  if (context.authUser) return <Redirect to="/configurator" />;
  return (
    <Container fluid>
      <Jumbotron>
        <Row>
          <Col>
            <h2>
              <BlackLoginSVG />
              <div className="content">Esegui il Login nel tuo account</div>
            </h2>

            <Form
              method="POST"
              onSubmit={(event) => handleSubmit(event, context.loginUser)}
            >
              <Form.Group controlId="username">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="E-mail"
                  value={username}
                  onChange={(ev) => setUsername(ev.target.value)}
                  required
                  autoFocus
                />
              </Form.Group>

              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Login
              </Button>
              <a href="/" className="float-right">
                <Button variant="danger">Back</Button>
              </a>
            </Form>

            {context.authErr && (
              <Alert variant="danger">{context.authErr.msg}</Alert>
            )}
          </Col>
        </Row>
      </Jumbotron>
    </Container>
  );
}

export default LoginForm;
