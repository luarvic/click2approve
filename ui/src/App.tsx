import { CssBaseline, ThemeProvider } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoadingOverlay from "./components/overlays/LoadingOverlay";
import MainLayout from "./layouts/MainLayout";
import ArchivePage from "./pages/approval/ArchivePage";
import FilesPage from "./pages/approval/FilesPage";
import InboxPage from "./pages/approval/InboxPage";
import SentPage from "./pages/approval/SentPage";
import ConfirmEmailPage from "./pages/identity/ConfirmEmailPage";
import ForgotPasswordPage from "./pages/identity/ForgotPasswordPage";
import ResendConfirmationEmailPage from "./pages/identity/ResendConfirmationEmailPage";
import ResetPasswordPage from "./pages/identity/ResetPasswordPage";
import SignInPage from "./pages/identity/SignInPage";
import SignUpPage from "./pages/identity/SignUpPage";
import HelpPage from "./pages/other/HelpPage";
import HomePage from "./pages/other/HomePage";
import InformationPage from "./pages/other/InformationPage";
import NotFoundPage from "./pages/other/NotFoundPage";
import { stores } from "./stores/Stores";
import {
  THEME,
  TOAST_AUTO_CLOSE,
  TOAST_CLOSE_BUTTON,
  TOAST_DRAGGABLE,
  TOAST_LIMIT,
} from "./stores/constantsStore";

const App = () => {
  useEffect(() => {
    stores.userAccountStore.signInWithCachedToken();
  }, []);

  return stores.userAccountStore.currentUser === undefined ? (
    <LoadingOverlay />
  ) : (
    <ThemeProvider theme={THEME}>
      <CssBaseline>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="help" element={<HelpPage />} />
              <Route path="/signIn" element={<SignInPage />} />
              <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
              <Route path="/signUp" element={<SignUpPage />} />
              <Route path="/files" element={<FilesPage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/sent" element={<SentPage />} />
              <Route
                path="/resendConfirmationEmail"
                element={<ResendConfirmationEmailPage />}
              />
              <Route path="/confirmEmail" element={<ConfirmEmailPage />} />
              <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
              <Route path="/resetPassword" element={<ResetPasswordPage />} />
              <Route path="/information" element={<InformationPage />} />
              <Route path="*" element={<NotFoundPage />} />
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
          stacked
        />
      </CssBaseline>
    </ThemeProvider>
  );
};

export default observer(App);
