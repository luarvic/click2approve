import { CssBaseline, ThemeProvider } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  THEME,
  TOAST_AUTO_CLOSE,
  TOAST_CLOSE_BUTTON,
  TOAST_DRAGGABLE,
  TOAST_LIMIT,
} from "../stores/Constants";
import { userAccountStore } from "../stores/UserAccountStore";
import Archive from "./Archive";
import Home from "./Home";
import Inbox from "./Inbox";
import NavBar from "./NavBar";
import NotFound from "./NotFound";
import Sent from "./Sent";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import UserFiles from "./UserFiles";

// Top level component.
const App = () => {
  const { trySigningInWithCachedUserAccount } = userAccountStore;

  useEffect(() => {
    trySigningInWithCachedUserAccount();
  }, []);

  return (
    <ThemeProvider theme={THEME}>
      <CssBaseline>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/files" element={<UserFiles />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/sent" element={<Sent />} />
            <Route path="/notfound" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer
          position="bottom-right"
          autoClose={TOAST_AUTO_CLOSE}
          pauseOnHover
          limit={TOAST_LIMIT}
          closeButton={TOAST_CLOSE_BUTTON}
          draggable={TOAST_DRAGGABLE}
        />
      </CssBaseline>
    </ThemeProvider>
  );
};

export default observer(App);
