import { CssBaseline, ThemeProvider } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoadingOverlay from "./components/overlays/LoadingOverlay";
import MainLayout from "./layouts/MainLayout";
import WrapperLayout from "./layouts/WrapperLayout";
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
import UserSettingsPage from "./pages/other/UserSettingsPage";
import { stores } from "./stores/Stores";
import {
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
    <ThemeProvider theme={stores.commonStore.theme}>
      <CssBaseline>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/files" element={<FilesPage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/sent" element={<SentPage />} />
              <Route path="/signIn" element={<SignInPage />} />
              <Route path="/signUp" element={<SignUpPage />} />
              <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
              <Route
                path="/resendConfirmationEmail"
                element={<ResendConfirmationEmailPage />}
              />
              <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
              <Route path="/resetPassword" element={<ResetPasswordPage />} />
              <Route element={<WrapperLayout />}>
                <Route index element={<HomePage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="/confirmEmail" element={<ConfirmEmailPage />} />
                <Route path="/information" element={<InformationPage />} />
                <Route path="/userSettings" element={<UserSettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
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
