import React from "react";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

function ModalPagamento(props) {
  const {
    mostraPagamento,
    prezzoNumeroAuto,
    handleCloseModal,
    handlePaymentSubmit,
    formPagamento,
    updateFormPagamento,
  } = props;
  return (
    <Modal show={mostraPagamento} onHide={handleCloseModal} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>Effettua pagamento</Modal.Title>
      </Modal.Header>
      <Alert variant="warning">
        Procedi al pagamento di: € {prezzoNumeroAuto.prezzo}
      </Alert>
      <Modal.Body>
        <Form
          method="POST"
          onSubmit={(event) => handlePaymentSubmit(event)}
          id="formPagamento"
        >
          <Form.Row>
            <Form.Group as={Col} controlId="nomeCompleto">
              <Form.Label>Nome intestatario</Form.Label>
              <Form.Control
                type="text"
                value={formPagamento.nomeCompleto}
                name="nomeCompleto"
                onChange={(ev) => updateFormPagamento(ev)}
                required
              />
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} controlId="ccnumber">
              <Form.Label>Numero della carta</Form.Label>
              <Form.Control
                placeholder=""
                value={formPagamento.numeroCarta}
                name="numeroCarta"
                onChange={(ev) =>
                  Number.isInteger(Number(ev.target.value))
                    ? updateFormPagamento(ev)
                    : {}
                }
                required
              />
            </Form.Group>
          </Form.Row>

          <Form.Row>
            <Form.Group as={Col} controlId="cvv">
              <Form.Label>CVV</Form.Label>
              <Form.Control
                value={formPagamento.cvv}
                min={0}
                max={999}
                name="cvv"
                onChange={(ev) =>
                  Number.isInteger(Number(ev.target.value))
                    ? updateFormPagamento(ev)
                    : {}
                }
                required
              />
            </Form.Group>
          </Form.Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
          Annulla
        </Button>
        <Button variant="primary" type="submit" form="formPagamento">
          Paga
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalPagamento;
