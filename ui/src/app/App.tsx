import { stores } from "@/app/rootStore";
import ApprovalRequestStartPage from "@/features/approvalRequests/pages/ApprovalRequestStartPage";
import ApprovalRequestSubmitPage from "@/features/approvalRequests/pages/ApprovalRequestSubmitPage";
import ApprovalRequestTaskEditorPage from "@/features/approvalRequests/pages/ApprovalRequestTaskEditorPage";
import ApprovalRequestViewPage from "@/features/approvalRequests/pages/ApprovalRequestViewPage";
import InboxPage from "@/features/approvalRequests/pages/InboxPage";
import OutboxPage from "@/features/approvalRequests/pages/OutboxPage";
import ApprovalStepTemplateEditorPage from "@/features/approvalStepTemplates/pages/ApprovalStepTemplateEditorPage";
import ApprovalStepTemplatesPage from "@/features/approvalStepTemplates/pages/ApprovalStepTemplatesPage";
import DelegationsPage from "@/features/delegations/pages/DelegationsPage";
import EmployeeEditorPage from "@/features/employees/pages/EmployeeEditorPage";
import EmployeesPage from "@/features/employees/pages/EmployeesPage";
import ConfirmEmailPage from "@/features/identity/pages/ConfirmEmailPage";
import ForgotPasswordPage from "@/features/identity/pages/ForgotPasswordPage";
import ResendConfirmationEmailPage from "@/features/identity/pages/ResendConfirmationEmailPage";
import ResetPasswordPage from "@/features/identity/pages/ResetPasswordPage";
import SignInPage from "@/features/identity/pages/SignInPage";
import SignUpPage from "@/features/identity/pages/SignUpPage";
import TeamEditorPage from "@/features/teams/pages/TeamEditorPage";
import TeamsPage from "@/features/teams/pages/TeamsPage";
import { EmployeeRole, TenantType } from "@/features/tenants/models/tenant";
import TenantEditorPage from "@/features/tenants/pages/TenantEditorPage";
import TenantsPage from "@/features/tenants/pages/TenantsPage";
import MainLayout from "@/layouts/MainLayout";
import TenantScopeLayout from "@/layouts/TenantScopeLayout";
import WrapperLayout from "@/layouts/WrapperLayout";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import RouteGuard from "@/shared/components/routing/RouteGuard";
import TenantHomeRedirect from "@/shared/components/routing/TenantHomeRedirect";
import { Toasts } from "@/shared/constants/constants";
import InformationPage from "@/shared/pages/InformationPage";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import UserProfilePage from "@/shared/pages/UserProfilePage";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const App = () => {
  const currentTenant = stores.tenantStore.currentTenant;
  const canManageTeams =
    stores.productStore.teamApproversAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant.role !== undefined;
  const canManageEmployees =
    stores.productStore.tenantsAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant.role !== undefined;
  const canViewTemplates =
    stores.productStore.approvalStepTemplatesAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant.role !== undefined;
  const canManageDelegations =
    currentTenant?.type === TenantType.Business &&
    currentTenant.role === EmployeeRole.Admin;

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
    <ThemeProvider theme={stores.userPreferencesStore.theme}>
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
              <Route element={<WrapperLayout />}>
                <Route path="/signIn" element={<SignInPage />} />
                <Route path="/signUp" element={<SignUpPage />} />
                <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
                <Route path="/confirmEmail" element={<ConfirmEmailPage />} />
                <Route
                  path="/resendConfirmationEmail"
                  element={<ResendConfirmationEmailPage />}
                />
                <Route path="/resetPassword" element={<ResetPasswordPage />} />
                <Route path="/information" element={<InformationPage />} />
                <Route path="*" element={<NotFoundPage />} />
                <Route element={<RouteGuard />}>
                  <Route path="/userProfile" element={<UserProfilePage />} />
                  <Route
                    element={
                      <RouteGuard
                        isAllowed={stores.productStore.tenantsAreEnabled}
                      />
                    }
                  >
                    <Route path="/tenants" element={<TenantsPage />} />
                    <Route path="/tenants/new" element={<TenantEditorPage />} />
                    <Route path="/tenants/:tenantId" element={<TenantEditorPage />} />
                  </Route>
                </Route>
              </Route>
              <Route element={<RouteGuard />}>
                <Route index element={<TenantHomeRedirect />} />
                <Route path="/tenants/:tenantId" element={<TenantScopeLayout />}>
                  <Route element={<WrapperLayout />}>
                    <Route path="inbox" element={<InboxPage />} />
                    <Route path="inbox/:taskId" element={<ApprovalRequestTaskEditorPage />} />
                    <Route path="outbox" element={<OutboxPage />} />
                    <Route path="outbox/new" element={<ApprovalRequestStartPage />} />
                    <Route path="outbox/new/compose" element={<ApprovalRequestSubmitPage />} />
                    <Route path="outbox/:approvalRequestId" element={<ApprovalRequestViewPage />} />
                    <Route element={<RouteGuard isAllowed={canViewTemplates} />}>
                      <Route path="approvalStepTemplates" element={<ApprovalStepTemplatesPage />} />
                    </Route>
                    <Route element={<RouteGuard isAllowed={canManageTeams} />}>
                      <Route path="teams" element={<TeamsPage />} />
                    </Route>
                    <Route element={<RouteGuard isAllowed={canManageEmployees} />}>
                      <Route path="employees" element={<EmployeesPage />} />
                    </Route>
                    <Route element={<RouteGuard isAllowed={canManageDelegations} />}>
                      <Route path="delegations" element={<DelegationsPage />} />
                    </Route>
                    <Route path="approvalStepTemplates/new" element={<ApprovalStepTemplateEditorPage />} />
                    <Route path="approvalStepTemplates/:templateId" element={<ApprovalStepTemplateEditorPage />} />
                    <Route path="teams/new" element={<TeamEditorPage />} />
                    <Route path="teams/:teamId" element={<TeamEditorPage />} />
                    <Route path="employees/new" element={<EmployeeEditorPage />} />
                    <Route path="employees/:employeeId" element={<EmployeeEditorPage />} />
                  </Route>
                </Route>
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
          theme={stores.userPreferencesStore.theme.palette.mode}
        />
      </CssBaseline>
    </ThemeProvider>
  );
};

export default observer(App);
