import { observer } from "mobx-react-lite";
import React, { Fragment, useContext, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Container } from "semantic-ui-react";
import { userUserAccountContext } from "../stores/UserAccountStore";
import Main from "./Home";
import NavBar from "./NavBar";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

const App = () => {
  const userAccountStore = useContext(userUserAccountContext);
  const { getCachedUserAccount, currentUser } = userAccountStore;

  useEffect(() => {
    getCachedUserAccount();
  }, []);

  return (
    <Fragment>
      <Container>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
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

export default observer(App);
