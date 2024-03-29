import { CssBaseline, ThemeProvider } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Fragment, useEffect } from "react";
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
import Home from "./Home";
import NavBar from "./NavBar";
import NotFound from "./NotFound";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import GridApprovalRequests from "./grids/GridApprovalRequests";
import GridArchive from "./grids/GridArchive";
import GridFiles from "./grids/GridFiles";
import GridInbox from "./grids/GridInbox";
import ConfirmEmail from "./ConfirmEmail";

// Top level component.
const App = () => {
  const { currentUser, signInWithCachedToken } = userAccountStore;

  useEffect(() => {
    signInWithCachedToken();
  }, []);

  return currentUser === undefined ? (
    <Fragment></Fragment>
  ) : (
    <ThemeProvider theme={THEME}>
      <CssBaseline>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/files"
              element={currentUser ? <GridFiles /> : <SignIn />}
            />
            <Route
              path="/inbox"
              element={currentUser ? <GridInbox /> : <SignIn />}
            />
            <Route
              path="/archive"
              element={currentUser ? <GridArchive /> : <SignIn />}
            />
            <Route
              path="/sent"
              element={currentUser ? <GridApprovalRequests /> : <SignIn />}
            />
            <Route path="*" element={<NotFound />} />
            <Route path="/confirmEmail" element={<ConfirmEmail />} />
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
