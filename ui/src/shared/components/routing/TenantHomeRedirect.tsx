import { stores } from "@/app/rootStore";
import { Routes } from "@/shared/constants/constants";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";

const TenantHomeRedirect = () => {
  if (!stores.tenantStore.hasLoaded) {
    return null;
  }

  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  return tenantGlobalId ? (
    <Navigate to={Routes.tenantPath(tenantGlobalId, Routes.tasksPath)} replace />
  ) : (
    <Navigate to="/signIn" replace />
  );
};

export default observer(TenantHomeRedirect);
