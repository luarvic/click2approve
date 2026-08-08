import { stores } from "@/app/rootStore";
import WrapperLayout from "@/layouts/WrapperLayout";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";

const TenantScopeLayout = () => {
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  const tenantScopeIsAvailable =
    stores.tenantStore.hasLoaded &&
    tenantGlobalId !== undefined &&
    (stores.applicationConfigurationStore.tenantsAreEnabled
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
    return (
      <WrapperLayout>
        <NotFoundPage />
      </WrapperLayout>
    );
  }

  if (stores.tenantStore.currentTenantGlobalId !== tenantGlobalId) {
    return <LoadingOverlay />;
  }

  return <Outlet />;
};

export default observer(TenantScopeLayout);
