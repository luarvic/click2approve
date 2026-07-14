import { stores } from "@/app/rootStore";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";

const TenantScopeLayout = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const parsedTenantId = Number(tenantId);
  const tenantScopeIsAvailable =
    stores.tenantStore.hasLoaded &&
    Number.isInteger(parsedTenantId) &&
    (stores.productStore.tenantsAreEnabled
      ? stores.tenantStore.tenants.some((tenant) => tenant.id === parsedTenantId)
      : stores.tenantStore.currentTenantId === parsedTenantId);

  useEffect(() => {
    if (
      tenantScopeIsAvailable &&
      stores.tenantStore.currentTenantId !== parsedTenantId
    ) {
      void stores.switchTenant(parsedTenantId);
    }
  }, [parsedTenantId, tenantScopeIsAvailable]);

  if (!stores.tenantStore.hasLoaded) {
    return <LoadingOverlay />;
  }

  if (!tenantScopeIsAvailable) {
    const currentTenantId = stores.tenantStore.currentTenantId;
    return currentTenantId ? (
      <Navigate to={Routes.tenantPath(currentTenantId, Routes.inboxPath)} replace />
    ) : (
      <Navigate to="/signIn" replace />
    );
  }

  if (stores.tenantStore.currentTenantId !== parsedTenantId) {
    return <LoadingOverlay />;
  }

  return <Outlet />;
};

export default observer(TenantScopeLayout);
