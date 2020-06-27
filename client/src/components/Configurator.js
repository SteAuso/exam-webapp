import React from "react";
import { useContext, useState, useEffect } from "react";
import moment from "moment";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { AuthContext } from "../auth/AuthContext";
import { Redirect } from "react-router-dom";
import { OptionalErrorMsg, GearSVG } from "./VariousComponent";
import ModalPagamento from "./ModalPagamento";
import API from "../api/API";

function Configurator() {
  const context = useContext(AuthContext);
  const [submitted, setSubmitted] = useState(false);
  const [formNoleggio, setFormNoleggio] = useState({
    dataInizio: "",
    dataFine: "",
    categoria: "",
    assicurazione: false,
    chilometri: "tra 50km e 150km",
    etaGuidatore: "",
    numeroGuidatoriAggiuntivi: 0,
  });
  const [prezzoNumeroAuto, setPrezzoNumeroAuto] = useState({
    prezzo: "-",
    numeroAutoDisponibili: "-",
  });
  const [mostraPagamento, setMostraPagamento] = useState(false);
  const [formPagamento, setFormPagamento] = useState({
    nomeCompleto: "",
    numeroCarta: "",
    cvv: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const handleCloseModal = () => {
    setMostraPagamento(false);
  };
  const handleShowModal = () => {
    setMostraPagamento(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      setPrezzoNumeroAuto({
        prezzo: "-",
        numeroAutoDisponibili: "-",
      });
      form.reportValidity();
    } else {
      handleShowModal();
    }
  };

  const handlePaymentSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) form.reportValidity();
    else {
      let provObj = {
        numeroCarta: formPagamento.numeroCarta,
        nomeCompleto: formPagamento.nomeCompleto,
        cvv: formPagamento.cvv,
        price: prezzoNumeroAuto.prezzo,
      };
      let provRental = {
        dataInizio: formNoleggio.dataInizio,
        dataFine: formNoleggio.dataFine,
        categoria: formNoleggio.categoria,
        chilometri: formNoleggio.chilometri,
        assicurazione: formNoleggio.assicurazione,
        etaGuidatore: formNoleggio.etaGuidatore,
        numeroGuidatoriAggiuntivi: formNoleggio.numeroGuidatoriAggiuntivi,
        // user: context.authUser,
      };
      API.pay(provObj)
        .then((r) => {
          if (r.success === true) {
            API.addRental(provRental)
              .then((r) => {
                if (r.success === true) {
                  setSubmitted(true);
                } else setErrorMsg("Errore nel pagamento");
              })
              .catch((err) => {
                let jsonObj = JSON.parse(JSON.stringify(err));
                setErrorMsg(jsonObj.errors[0].msg);
                setPrezzoNumeroAuto({
                  prezzo: "-",
                  numeroAutoDisponibili: "-",
                });
                setMostraPagamento(false);
              });
          } else {
            setErrorMsg("Pagamento non riuscito");
          }
        })
        .catch((err) => setErrorMsg("Problemi nella conferma del noleggio"));
    }
  };

  const cancelErrorMsg = () => {
    setErrorMsg("");
  };

  const aggiornaDataInizio = (ev) => {
    return ev.target.value >= moment().format("YYYY-MM-DD") &&
      (formNoleggio.dataFine === "" || formNoleggio.dataFine >= ev.target.value)
      ? updateFormNoleggio(ev)
      : {};
  };

  const aggiornaDataFine = (ev) => {
    return ev.target.value >= moment().format("YYYY-MM-DD") &&
      (formNoleggio.dataInizio === "" ||
        formNoleggio.dataInizio <= ev.target.value)
      ? updateFormNoleggio(ev)
      : {};
  };

  useEffect(() => {
    if (
      formNoleggio.dataInizio &&
      formNoleggio.dataFine &&
      formNoleggio.categoria &&
      formNoleggio.chilometri &&
      (formNoleggio.etaGuidatore === "" ||
        (formNoleggio.etaGuidatore >= 18 && formNoleggio.etaGuidatore <= 110))
      // formNoleggio.etaGuidatore &&
      // formNoleggio.etaGuidatore >= 18
    ) {
      let provObj = {
        dataInizio: formNoleggio.dataInizio,
        dataFine: formNoleggio.dataFine,
        categoria: formNoleggio.categoria,
        chilometri: formNoleggio.chilometri,
        assicurazione: formNoleggio.assicurazione,
        etaGuidatore: formNoleggio.etaGuidatore || 40, //valore di default per ottenere subito un preventivo
        numeroGuidatoriAggiuntivi: formNoleggio.numeroGuidatoriAggiuntivi,
        // user: context.authUser,
      };
      setMostraPagamento(false);
      API.getPriceQuantity(provObj)
        .then((a) => {
          if (a.quantity === 0)
            setPrezzoNumeroAuto({
              prezzo: "-",
              numeroAutoDisponibili: a.quantity,
            });
          else
            setPrezzoNumeroAuto({
              prezzo: a.price,
              numeroAutoDisponibili: a.quantity,
            });
        })
        .catch((err) => {
          let jsonObj = JSON.parse(JSON.stringify(err));
          setErrorMsg(jsonObj.errors[0].msg);
          setPrezzoNumeroAuto({
            prezzo: "-",
            numeroAutoDisponibili: "-",
          });
        });
    }
  }, [
    formNoleggio.dataInizio,
    formNoleggio.dataFine,
    formNoleggio.categoria,
    formNoleggio.assicurazione,
    formNoleggio.chilometri,
    formNoleggio.etaGuidatore,
    formNoleggio.numeroGuidatoriAggiuntivi,
    context,
  ]);

  const updateFormPagamento = (ev) => {
    setFormPagamento({
      ...formPagamento,
      [ev.target.name]: ev.target.value,
    });
  };

  const updateFormNoleggio = (ev) => {
    setFormNoleggio({
      ...formNoleggio,
      [ev.target.name]:
        ev.target.name === "assicurazione"
          ? !formNoleggio.assicurazione
          : ev.target.value,
    });
  };

  if (submitted) return <Redirect to="/rentals" />;
  return (
    <>
      <OptionalErrorMsg errorMsg={errorMsg} cancelErrorMsg={cancelErrorMsg} />
      {!context.authUser && <Redirect to="/login" />}
      {context.authUser && (
        <Container className="mt-3 bg-light">
          <Row className="justify-content-center">
            <GearSVG />
          </Row>
          <Row className="justify-content-center">
            <h2>Configuratore</h2>
          </Row>
          <Row className="justify-content-center mb-4">
            <p className="lead">Configuratore interattivo per l'autonoleggio</p>
          </Row>
          <Row>
            <Col sm={8}>
              <h4>
                <span className="text-muted">Parametri noleggio:</span>
              </h4>
              <Form
                id="formPrenotazione"
                method="POST"
                onSubmit={(event) => handleSubmit(event)}
              >
                <Form.Row>
                  <Form.Group as={Col} controlId="formStartDate">
                    <Form.Label>Data inizio noleggio</Form.Label>
                    <Form.Control
                      type="date"
                      value={formNoleggio.dataInizio}
                      name="dataInizio"
                      onChange={aggiornaDataInizio}
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="formFinishDate">
                    <Form.Label>Data fine noleggio</Form.Label>
                    <Form.Control
                      type="date"
                      value={formNoleggio.dataFine}
                      name="dataFine"
                      onChange={aggiornaDataFine}
                      required
                    />
                  </Form.Group>
                </Form.Row>

                <Form.Row>
                  <Form.Group as={Col} controlId="Category">
                    <Form.Label>Categoria</Form.Label>
                    <Form.Control
                      as="select"
                      value={formNoleggio.categoria}
                      name="categoria"
                      onChange={updateFormNoleggio}
                      required
                    >
                      <option value="" defaultValue hidden>
                        Scegliere...
                      </option>
                      <option>A</option>
                      <option>B</option>
                      <option>C</option>
                      <option>D</option>
                      <option>E</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group as={Col}>
                    <Form.Label as="legend" column sm={2}>
                      Assicurazione
                    </Form.Label>
                    <Col xs="auto">
                      <Form.Check
                        type="checkbox"
                        id="autoSizingCheck"
                        className="mb-2"
                        label="Sì"
                        checked={formNoleggio.assicurazione}
                        name="assicurazione"
                        onChange={updateFormNoleggio}
                      />
                    </Col>
                  </Form.Group>

                  <Form.Group as={Col} controlId="kilometers">
                    <Form.Label>Chilometri giornalieri stimati</Form.Label>
                    <Form.Control
                      as="select"
                      value={formNoleggio.chilometri}
                      name="chilometri"
                      onChange={updateFormNoleggio}
                      required
                    >
                      <option>meno di 50km</option>
                      <option>tra 50km e 150km</option>
                      <option>chilometri illimitati</option>
                    </Form.Control>
                  </Form.Group>
                </Form.Row>

                <Form.Row>
                  <Form.Group as={Col} controlId="age">
                    <Form.Label>Età guidatore</Form.Label>
                    <Form.Control
                      placeholder="≥ 18"
                      type="number"
                      value={formNoleggio.etaGuidatore}
                      min={18}
                      max={110}
                      name="etaGuidatore"
                      onChange={(ev) =>
                        Number.isInteger(Number(ev.target.value))
                          ? updateFormNoleggio(ev)
                          : {}
                      }
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} controlId="age">
                    <Form.Label>Numero guidatori aggiuntivi</Form.Label>
                    <Form.Control
                      placeholder="0"
                      type="number"
                      value={formNoleggio.numeroGuidatoriAggiuntivi}
                      name="numeroGuidatoriAggiuntivi"
                      onChange={(ev) =>
                        Number.isInteger(Number(ev.target.value))
                          ? updateFormNoleggio(ev)
                          : {}
                      }
                      required
                    />
                  </Form.Group>
                </Form.Row>
              </Form>
            </Col>

            <Col sm={4}>
              <h4>
                <span className="text-muted">Possibile auto:</span>
              </h4>
              <ul className="list-group mb-3">
                <li className="list-group-item d-flex justify-content-between bg-success">
                  <h2>
                    <span>Totale:</span>
                  </h2>
                  <h1>
                    <strong>€ {prezzoNumeroAuto.prezzo}</strong>
                  </h1>
                </li>
                <li className="list-group-item d-flex justify-content-between bg-success">
                  <h3>
                    <span>Auto disponibili:</span>
                  </h3>
                  <h2>
                    <strong>{prezzoNumeroAuto.numeroAutoDisponibili}</strong>
                  </h2>
                </li>
                {prezzoNumeroAuto.numeroAutoDisponibili !== 0 &&
                  prezzoNumeroAuto.prezzo !== "-" &&
                  !mostraPagamento &&
                  formNoleggio.etaGuidatore >= 18 &&
                  formNoleggio.etaGuidatore <= 110 && (
                    <Button
                      variant="primary"
                      type="submit"
                      form="formPrenotazione"
                    >
                      Noleggiane una
                    </Button>
                  )}
              </ul>
            </Col>
          </Row>

          <ModalPagamento
            mostraPagamento={mostraPagamento}
            prezzoNumeroAuto={prezzoNumeroAuto}
            handleCloseModal={handleCloseModal}
            handlePaymentSubmit={handlePaymentSubmit}
            formPagamento={formPagamento}
            updateFormPagamento={updateFormPagamento}
          />
        </Container>
      )}
    </>
  );
}

export default Configurator;
