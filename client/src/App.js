import React, { useState, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import CarsList from "./components/CarsList";
import LoginForm from "./components/LoginForm";
import Configurator from "./components/Configurator";
import Noleggi from "./components/Noleggi";
import { Loading } from "./components/VariousComponent";
import { AuthContext } from "./auth/AuthContext";
import API from "./api/API";

function App() {
  const [marche, setMarche] = useState([]);
  const [openMobileMenu, setOpenMobileMenu] = useState();
  const [auto, setAuto] = useState([]);
  const [filteredAuto, setFilteredAuto] = useState([]);
  const [activeFiltersCategoria, setActiveFiltersCategoria] = useState([]);
  const [activeFiltersMarca, setActiveFiltersMarca] = useState([]);
  const [authUser, setAuthUser] = useState();
  const [authErr, setAuthErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.isAuthenticated()
      .then((user) => {
        setAuthUser(user);
      })
      .catch((err) => {
        setAuthErr(err.errorObj);
      });
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInitialData = () => {
    API.getCars()
      .then((cars) => {
        setAuto(cars);
        setFilteredAuto(cars);
        setMarche([...new Set(cars.map((car) => car.marca))].sort());
        setLoading(false);
      })
      .catch((errorObj) => {
        errorObj = JSON.stringify(errorObj);
        handleErrors(errorObj);
      });
  };

  const handleErrors = (errorObj) => {
    if (errorObj && errorObj !== "{}") {
      if (errorObj.status && errorObj.status === 401) {
        setTimeout(() => {
          setAuthErr("Generic error");
        }, 2000);
      }
      setLoading(false);
    }
  };

  const logout = () => {
    API.userLogout().then(() => {
      setAuthUser(null);
      setAuthErr(null);
    });
  };

  const login = (username, password) => {
    API.userLogin(username, password)
      .then((user) => {
        setAuthUser(user);
        setAuthErr(null);
      })
      .catch((errorObj) => {
        const err0 = errorObj.errors[0];
        setAuthErr(err0);
      });
  };

  function showSidebar() {
    setOpenMobileMenu(!openMobileMenu);
  }

  const swapFilter = (filter) => {
    let provCategorie = activeFiltersCategoria;
    let provMarche = activeFiltersMarca;
    let provFilteredAuto = auto;
    if (
      filter === "A" ||
      filter === "B" ||
      filter === "C" ||
      filter === "D" ||
      filter === "E"
    ) {
      provCategorie = provCategorie.includes(filter)
        ? provCategorie.filter((c) => c !== filter)
        : [...provCategorie, filter];
    } else
      provMarche = provMarche.includes(filter)
        ? provMarche.filter((m) => m !== filter)
        : [...provMarche, filter];

    if (provCategorie.length !== 0)
      provFilteredAuto = provFilteredAuto.filter((a) =>
        provCategorie.includes(a.categoria)
      );
    if (provMarche.length !== 0)
      provFilteredAuto = provFilteredAuto.filter((a) =>
        provMarche.includes(a.marca)
      );
    setActiveFiltersCategoria(provCategorie);
    setActiveFiltersMarca(provMarche);
    setFilteredAuto(provFilteredAuto);
  };

  const value = {
    authUser: authUser,
    authErr: authErr,
    loginUser: login,
    logoutUser: logout,
    removeAuthUser: () => setAuthUser(""),
  };
  return (
    <AuthContext.Provider value={value}>
      <Container fluid>
        <Switch>
          <Route path="/login">
            <Row className="vheight-100">
              <Col sm={4}></Col>
              <Col sm={4} className="below-nav">
                <LoginForm />
              </Col>
            </Row>
          </Route>
          <Route path="/configurator">
            <Header showSidebar={showSidebar} />
            <Container className="below-nav">
              <Configurator />
            </Container>
          </Route>
          <Route path="/rentals">
            {loading && (
              <>
                <Loading />
              </>
            )}
            {!loading && (
              <>
                <Header showSidebar={showSidebar} />
                <Container className="below-nav">
                  <Noleggi />
                </Container>
              </>
            )}
          </Route>
          <Route path="/">
            {loading && (
              <>
                <Loading />
              </>
            )}
            {!loading && (
              <>
                <Header showSidebar={showSidebar} />
                <Row>
                  <Collapse in={openMobileMenu}>
                    <Col
                      sm={2}
                      bg="light"
                      id="left-sidebar"
                      className="collapse d-sm-block"
                    >
                      <Sidebar
                        marche={marche}
                        activeFilter={activeFiltersCategoria.concat(
                          activeFiltersMarca
                        )}
                        swapFilter={swapFilter}
                      />
                    </Col>
                  </Collapse>
                  <Col sm={9} className="offset-sm-1 below-nav">
                    <CarsList cars={filteredAuto} />
                  </Col>
                </Row>
              </>
            )}
          </Route>
        </Switch>
      </Container>
    </AuthContext.Provider>
  );
}

export default App;
