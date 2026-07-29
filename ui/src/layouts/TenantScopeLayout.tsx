import { stores } from "@/app/rootStore";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";

const TenantScopeLayout = () => {
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  const tenantScopeIsAvailable =
    stores.tenantStore.hasLoaded &&
    tenantGlobalId !== undefined &&
    (stores.productStore.tenantsAreEnabled
      ? stores.tenantStore.tenants.some((tenant) => tenant.globalId === tenantGlobalId)
      : stores.tenantStore.currentTenantGlobalId === tenantGlobalId);

  useEffect(() => {
    if (
      tenantScopeIsAvailable &&
      tenantGlobalId !== undefined &&
      stores.tenantStore.currentTenantGlobalId !== tenantGlobalId
    ) {
      void stores.switchTenant(tenantGlobalId);
    }
  }, [tenantGlobalId, tenantScopeIsAvailable]);

  if (!stores.tenantStore.hasLoaded) {
    return <LoadingOverlay />;
  }

  if (!tenantScopeIsAvailable) {
    const currentTenantGlobalId = stores.tenantStore.currentTenantGlobalId;
    return currentTenantGlobalId ? (
      <Navigate to={Routes.tenantPath(currentTenantGlobalId, Routes.inboxPath)} replace />
    ) : (
      <Navigate to="/signIn" replace />
    );
  }

  if (stores.tenantStore.currentTenantGlobalId !== tenantGlobalId) {
    return <LoadingOverlay />;
  }

  return <Outlet />;
};

export default observer(TenantScopeLayout);
