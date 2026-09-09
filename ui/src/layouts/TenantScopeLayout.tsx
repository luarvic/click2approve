import { stores } from "@/app/rootStore";
import KnownBillingAccess from "@/features/subscriptions/components/KnownBillingAccess";
import WrapperLayout from "@/layouts/WrapperLayout";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Outlet, useMatch, useParams } from "react-router-dom";

const TenantScopeLayout = () => {
  const isPlansPage = Boolean(useMatch("/tenants/:tenantGlobalId/plans"));
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
      if (isPlansPage) {
        // Billing verifies provider state before any protected workspace data should be requested.
        stores.clearTenantScope();
        const tenant = stores.tenantStore.tenants.find((item) => item.globalId === tenantGlobalId);
        stores.tenantStore.setCurrentScope(tenantGlobalId, tenant?.currentEmployeeGlobalId ?? null);
        return;
      }
      const loader = ActionLoaders.pages.tenantScope();
      stores.commonStore.updateActionLoadingCounter(loader, 1);
      void stores.switchTenant(tenantGlobalId).finally(() => stores.commonStore.updateActionLoadingCounter(loader, -1));
    }
  }, [isPlansPage, tenantGlobalId, tenantScopeIsAvailable]);

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

  return (
    <KnownBillingAccess>
      <Outlet />
    </KnownBillingAccess>
  );
};

export default observer(TenantScopeLayout);
