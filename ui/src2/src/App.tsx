import { CssBaseline, ThemeProvider } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import MainLayout from "./layouts/MainLayout";
import ArchivePage from "./pages/ArchivePage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import FilesPage from "./pages/FilesPage";
import HomePage from "./pages/HomePage";
import InboxPage from "./pages/InboxPage";
import NotFoundPage from "./pages/NotFoundPage";
import SentPage from "./pages/SentPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import {
  THEME,
  TOAST_AUTO_CLOSE,
  TOAST_CLOSE_BUTTON,
  TOAST_DRAGGABLE,
  TOAST_LIMIT,
} from "./stores/constantsStore";
import { userAccountStore } from "./stores/userAccountStore";

// Top level component.
const App = () => {
  const { currentUser, signInWithCachedToken } = userAccountStore;

  useEffect(() => {
    signInWithCachedToken();
  }, []);

  return currentUser === undefined ? (
    <></>
  ) : (
    <ThemeProvider theme={THEME}>
      <CssBaseline>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route
                path="/files"
                element={currentUser ? <FilesPage /> : <SignInPage />}
              />
              <Route
                path="/inbox"
                element={currentUser ? <InboxPage /> : <SignInPage />}
              />
              <Route
                path="/archive"
                element={currentUser ? <ArchivePage /> : <SignInPage />}
              />
              <Route
                path="/sent"
                element={currentUser ? <SentPage /> : <SignInPage />}
              />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/confirmEmail" element={<ConfirmEmailPage />} />
            </Route>
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
