import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import LoadingOverlay from "./components/overlays/LoadingOverlay";
import {
  TOAST_AUTO_CLOSE,
  TOAST_CLOSE_BUTTON,
  TOAST_DRAGGABLE,
  TOAST_LIMIT,
} from "./data/constants";
import MainLayout from "./layouts/MainLayout";
import WrapperLayout from "./layouts/WrapperLayout";
import InboxPage from "./pages/approval/InboxPage";
import OutboxPage from "./pages/approval/OutboxPage";
import ConfirmEmailPage from "./pages/identity/ConfirmEmailPage";
import ForgotPasswordPage from "./pages/identity/ForgotPasswordPage";
import ResendConfirmationEmailPage from "./pages/identity/ResendConfirmationEmailPage";
import ResetPasswordPage from "./pages/identity/ResetPasswordPage";
import SignInPage from "./pages/identity/SignInPage";
import SignUpPage from "./pages/identity/SignUpPage";
import HomePage from "./pages/other/HomePage";
import InformationPage from "./pages/other/InformationPage";
import NotFoundPage from "./pages/other/NotFoundPage";
import TenantUsersPage from "./pages/other/TenantUsersPage";
import TenantWelcomePage from "./pages/other/TenantWelcomePage";
import UserSettingsPage from "./pages/other/UserSettingsPage";
import { stores } from "./stores/stores";

const App = () => {
  useEffect(() => {
    const load = async () => {
      await stores.productStore.load();
      await stores.userAccountStore.signInWithCachedToken();
    };
    load();
  }, []);

  return stores.userAccountStore.currentUser === undefined ||
    stores.productStore.productInfo === null ? (
    <LoadingOverlay />
  ) : (
    <ThemeProvider theme={stores.userSettingsStore.theme}>
      <CssBaseline>
        <BrowserRouter
          basename="ui"
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/outbox" element={<OutboxPage />} />
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
                <Route path="/confirmEmail" element={<ConfirmEmailPage />} />
                <Route path="/information" element={<InformationPage />} />
                <Route path="/tenantWelcome" element={<TenantWelcomePage />} />
                <Route path="/tenantUsers" element={<TenantUsersPage />} />
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
          theme={stores.userSettingsStore.theme.palette.mode}
        />
      </CssBaseline>
    </ThemeProvider>
  );
};

export default observer(App);
