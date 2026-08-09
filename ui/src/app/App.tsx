import { stores } from "@/app/rootStore";
import ApprovalRequestStartPage from "@/features/approvalRequests/pages/ApprovalRequestStartPage";
import ApprovalRequestSubmitPage from "@/features/approvalRequests/pages/ApprovalRequestSubmitPage";
import ApprovalRequestTaskPage from "@/features/approvalRequests/pages/ApprovalRequestTaskPage";
import ApprovalRequestViewPage from "@/features/approvalRequests/pages/ApprovalRequestViewPage";
import InboxPage from "@/features/approvalRequests/pages/InboxPage";
import OutboxPage from "@/features/approvalRequests/pages/OutboxPage";
import ApprovalStepTemplateEditorPage from "@/features/approvalStepTemplates/pages/ApprovalStepTemplateEditorPage";
import ApprovalStepTemplatesPage from "@/features/approvalStepTemplates/pages/ApprovalStepTemplatesPage";
import DelegationEditorPage from "@/features/delegations/pages/DelegationEditorPage";
import DelegationsPage from "@/features/delegations/pages/DelegationsPage";
import EmployeeEditorPage from "@/features/employees/pages/EmployeeEditorPage";
import EmployeesPage from "@/features/employees/pages/EmployeesPage";
import ConfirmEmailPage from "@/features/identity/pages/ConfirmEmailPage";
import ForgotPasswordPage from "@/features/identity/pages/ForgotPasswordPage";
import ResendConfirmationEmailPage from "@/features/identity/pages/ResendConfirmationEmailPage";
import ResetPasswordPage from "@/features/identity/pages/ResetPasswordPage";
import SignInPage from "@/features/identity/pages/SignInPage";
import SignUpPage from "@/features/identity/pages/SignUpPage";
import SharedVerificationReceiptPage from "@/features/sharedVerificationLinks/pages/SharedVerificationReceiptPage";
import TeamEditorPage from "@/features/teams/pages/TeamEditorPage";
import TeamsPage from "@/features/teams/pages/TeamsPage";
import { EmployeeRole, TenantType } from "@/features/tenants/models/tenant";
import TenantEditorPage from "@/features/tenants/pages/TenantEditorPage";
import TenantsPage from "@/features/tenants/pages/TenantsPage";
import MainLayout from "@/layouts/MainLayout";
import PublicLayout from "@/layouts/PublicLayout";
import TenantScopeLayout from "@/layouts/TenantScopeLayout";
import WrapperLayout from "@/layouts/WrapperLayout";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import Notifications from "@/shared/components/overlays/Notifications";
import AnonymousRoute from "@/shared/components/routing/AnonymousRoute";
import NotFoundRoute from "@/shared/components/routing/NotFoundRoute";
import RouteGuard from "@/shared/components/routing/RouteGuard";
import TenantHomeRedirect from "@/shared/components/routing/TenantHomeRedirect";
import InformationPage from "@/shared/pages/InformationPage";
import UserProfilePage from "@/shared/pages/UserProfilePage";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const App = () => {
  const currentTenant = stores.tenantStore.currentTenant;
  const canManageTeams =
    stores.applicationConfigurationStore.teamAssigneesAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant.currentEmployeeRole !== undefined;
  const canManageEmployees =
    stores.applicationConfigurationStore.tenantsAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant.currentEmployeeRole !== undefined;
  const canViewTemplates =
    stores.applicationConfigurationStore.approvalStepTemplatesAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant.currentEmployeeRole !== undefined;
  const canManageDelegations =
    currentTenant?.type === TenantType.Business &&
    (currentTenant.currentEmployeeRole === EmployeeRole.Admin ||
      currentTenant.currentEmployeeRole === EmployeeRole.Owner);
  const canViewDelegations =
    currentTenant?.type === TenantType.Business &&
    currentTenant.currentEmployeeRole !== undefined;

  useEffect(() => {
    const load = async () => {
      await stores.applicationConfigurationStore.load();
      await stores.userAccountStore.signInWithCachedToken();
    };
    load();
  }, []);

  return stores.userAccountStore.currentUser === undefined ||
    stores.applicationConfigurationStore.applicationConfiguration === null ? (
    <LoadingOverlay />
  ) : (
    <ThemeProvider theme={stores.userPreferencesStore.theme}>
      <CssBaseline>
        <BrowserRouter
          basename="app"
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true,
          }}
        >
          <Routes>
            <Route path="/verification/:globalId" element={<SharedVerificationReceiptPage />} />
            <Route element={<PublicLayout />}>
              <Route element={<WrapperLayout />}>
                <Route element={<AnonymousRoute />}>
                  <Route path="/signIn" element={<SignInPage />} />
                  <Route path="/signUp" element={<SignUpPage />} />
                  <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
                  <Route
                    path="/resendConfirmationEmail"
                    element={<ResendConfirmationEmailPage />}
                  />
                  <Route path="/resetPassword" element={<ResetPasswordPage />} />
                </Route>
                <Route path="/confirmEmail" element={<ConfirmEmailPage />} />
                <Route path="/information" element={<InformationPage />} />
              </Route>
            </Route>
            <Route element={<RouteGuard />}>
              <Route element={<MainLayout />}>
                <Route element={<WrapperLayout />}>
                  <Route path="/userProfile" element={<UserProfilePage />} />
                  <Route
                    element={
                      <RouteGuard
                        isAllowed={stores.applicationConfigurationStore.tenantsAreEnabled}
                      />
                    }
                  >
                    <Route path="/tenants" element={<TenantsPage />} />
                    <Route path="/tenants/new" element={<TenantEditorPage />} />
                    <Route path="/tenants/:tenantGlobalId" element={<TenantEditorPage />} />
                  </Route>
                </Route>
                <Route index element={<TenantHomeRedirect />} />
                <Route path="/tenants/:tenantGlobalId" element={<TenantScopeLayout />}>
                  <Route element={<WrapperLayout />}>
                    <Route path="inbox" element={<InboxPage />} />
                    <Route path="inbox/:taskGlobalId" element={<ApprovalRequestTaskPage />} />
                    <Route path="outbox" element={<OutboxPage />} />
                    <Route path="outbox/new" element={<ApprovalRequestStartPage />} />
                    <Route path="outbox/new/compose" element={<ApprovalRequestSubmitPage />} />
                    <Route path="outbox/:approvalRequestGlobalId/resubmit" element={<ApprovalRequestSubmitPage />} />
                    <Route path="outbox/:approvalRequestGlobalId" element={<ApprovalRequestViewPage />} />
                    <Route element={<RouteGuard isAllowed={canViewTemplates} />}>
                      <Route path="approvalStepTemplates" element={<ApprovalStepTemplatesPage />} />
                    </Route>
                    <Route element={<RouteGuard isAllowed={canManageTeams} />}>
                      <Route path="teams" element={<TeamsPage />} />
                    </Route>
                    <Route element={<RouteGuard isAllowed={canManageEmployees} />}>
                      <Route path="employees" element={<EmployeesPage />} />
                    </Route>
                    <Route element={<RouteGuard isAllowed={canViewDelegations} />}>
                      <Route path="delegations" element={<DelegationsPage />} />
                      <Route path="delegations/:delegationGlobalId" element={<DelegationEditorPage />} />
                    </Route>
                    <Route element={<RouteGuard isAllowed={canManageDelegations} />}>
                      <Route path="delegations/new" element={<DelegationEditorPage />} />
                    </Route>
                    <Route path="approvalStepTemplates/new" element={<ApprovalStepTemplateEditorPage />} />
                    <Route path="approvalStepTemplates/:templateGlobalId" element={<ApprovalStepTemplateEditorPage />} />
                    <Route path="teams/new" element={<TeamEditorPage />} />
                    <Route path="teams/:teamGlobalId" element={<TeamEditorPage />} />
                    <Route path="employees/new" element={<EmployeeEditorPage />} />
                    <Route path="employees/:employeeGlobalId" element={<EmployeeEditorPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFoundRoute />} />
          </Routes>
        </BrowserRouter>
        <Notifications />
      </CssBaseline>
    </ThemeProvider>
  );
};

export default observer(App);
