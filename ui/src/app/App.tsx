import { stores } from "@/app/rootStore";
import InboxPage from "@/features/approvalRequests/pages/InboxPage";
import OutboxPage from "@/features/approvalRequests/pages/OutboxPage";
import ApprovalStepTemplatesPage from "@/features/approvalStepTemplates/pages/ApprovalStepTemplatesPage";
import EmployeesPage from "@/features/employees/pages/EmployeesPage";
import ConfirmEmailPage from "@/features/identity/pages/ConfirmEmailPage";
import ForgotPasswordPage from "@/features/identity/pages/ForgotPasswordPage";
import ResendConfirmationEmailPage from "@/features/identity/pages/ResendConfirmationEmailPage";
import ResetPasswordPage from "@/features/identity/pages/ResetPasswordPage";
import SignInPage from "@/features/identity/pages/SignInPage";
import SignUpPage from "@/features/identity/pages/SignUpPage";
import TeamsPage from "@/features/teams/pages/TeamsPage";
import TenantsPage from "@/features/tenants/pages/TenantsPage";
import TenantWelcomePage from "@/features/tenants/pages/TenantWelcomePage";
import MainLayout from "@/layouts/MainLayout";
import WrapperLayout from "@/layouts/WrapperLayout";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes as AppRoutes, Toasts } from "@/shared/constants/constants";
import HomePage from "@/shared/pages/HomePage";
import InformationPage from "@/shared/pages/InformationPage";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import UserSettingsPage from "@/shared/pages/UserSettingsPage";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

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
              <Route path={AppRoutes.inboxPath} element={<InboxPage />} />
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
                <Route
                  path="/approvalStepTemplates"
                  element={<ApprovalStepTemplatesPage />}
                />
                <Route path="/tenants" element={<TenantsPage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/userSettings" element={<UserSettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer
          position="bottom-right"
          autoClose={Toasts.autoClose}
          pauseOnHover
          limit={Toasts.limit}
          closeButton={Toasts.closeButton}
          draggable={Toasts.draggable}
          stacked
          theme={stores.userSettingsStore.theme.palette.mode}
        />
      </CssBaseline>
    </ThemeProvider>
  );
};

export default observer(App);
