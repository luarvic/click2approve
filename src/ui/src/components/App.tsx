import React, { Fragment } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Container } from "semantic-ui-react";
import NavBar from "./NavBar";
import UserFiles from "./UserFiles";
import { ToastContainer } from "react-toastify";

const App = () => {
  return (
    <Fragment>
      <Container>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<UserFiles />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer
          position="bottom-right"
          autoClose={10000}
          pauseOnHover
          limit={3}
          closeButton={true}
          draggable={false}
        />
      </Container>
    </Fragment>
  );
};

export default App;
