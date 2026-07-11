import { stores } from "@/app/rootStore";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";

const TenantHomeRedirect = () => {
  if (!stores.userAccountStore.currentUser) {
    return <Navigate to="/signIn" replace />;
  }

  if (!stores.tenantStore.hasLoaded) {
    return <LoadingOverlay />;
  }

  const tenantId = stores.tenantStore.currentTenantId;
  return tenantId ? (
    <Navigate to={Routes.tenantPath(tenantId, Routes.inboxPath)} replace />
  ) : (
    <Navigate to="/signIn" replace />
  );
};

export default observer(TenantHomeRedirect);
