import { stores } from "@/app/rootStore";
import WrapperLayout from "@/layouts/WrapperLayout";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
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
      const loader = ActionLoaders.pages.tenantScope();
      stores.commonStore.updateActionLoadingCounter(loader, 1);
      void stores.switchTenant(tenantGlobalId).finally(() => stores.commonStore.updateActionLoadingCounter(loader, -1));
    }
  }, [tenantGlobalId, tenantScopeIsAvailable]);

  if (!stores.tenantStore.hasLoaded) {
    return null;
  }

  if (!tenantScopeIsAvailable) {
    return (
      <WrapperLayout>
        <NotFoundPage />
      </WrapperLayout>
    );
  }

  if (stores.tenantStore.currentTenantGlobalId !== tenantGlobalId) {
    return null;
  }

  return <Outlet />;
};

export default observer(TenantScopeLayout);
