import { Container } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useContext, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { userAccountStoreContext } from "../stores/UserAccountStore";
import Home from "./Home";
import NavBar from "./NavBar";
import NotFound from "./NotFound";
import SharedFile from "./SharedFile";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

// Top level component.
const App = () => {
  const userAccountStore = useContext(userAccountStoreContext);
  const { trySigningInWithCachedUserAccount } = userAccountStore;

  useEffect(() => {
    trySigningInWithCachedUserAccount();
  }, []);

  return (
    <Container>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/file/:key" element={<SharedFile />} />
          <Route path="/notfound" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
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
  );
};

export default observer(App);
