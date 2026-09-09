import { stores } from "@/app/rootStore";
import { recoverPayment } from "@/features/subscriptions/api/subscriptionsApi";
import TenantDialog, { OrganizationDraft } from "@/features/tenants/components/TenantDialog";
import { SubscriptionPlan, Tenant } from "@/features/tenants/models/tenant";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { Navigate, Outlet, useMatch, useNavigate } from "react-router-dom";

const OrganizationCreationPage = () => {
  const navigate = useNavigate();
  const isPlanSelection = Boolean(useMatch("/tenants/new/plans"));
  const createdTenant = useRef<{ tenant: Tenant; plan: SubscriptionPlan } | null>(null);
  const [checkoutIsOpening, setCheckoutIsOpening] = useState(false);
  const [draft, setDraft] = useState<OrganizationDraft>();
  usePageTitle(isPlanSelection ? "Choose plan" : "New organization");

  if (!stores.tenantStore.hasLoaded) return null;
  if (isPlanSelection && !draft) return <Navigate replace to="/tenants/new" />;

  const choosePlan = async (subscriptionPlan: SubscriptionPlan) => {
    if (!draft) return;
    const isTrial = (createdTenant.current?.plan ?? subscriptionPlan) === SubscriptionPlan.BusinessTrial;
    const payload = { ...draft.details, subscriptionPlan };
    const tenant =
      createdTenant.current?.tenant ??
      (draft.logo
        ? await stores.tenantStore.createWithLogo(payload, draft.logo, false)
        : await stores.tenantStore.create(payload, false));
    if (!tenant) return;
    createdTenant.current ??= { tenant, plan: subscriptionPlan };

    // Newly created paid organizations are pending payment. Record that before any workspace switch.
    if (!isTrial) stores.billingAccessStore.block(tenant.globalId);
    const openOrganizations = () => {
      stores.clearTenantScope();
      stores.tenantStore.setCurrentScope(tenant.globalId, tenant.currentEmployeeGlobalId ?? null);
      navigate("/tenants", { replace: true, state: { currentTenantGlobalId: tenant.globalId } });
    };
    if (isTrial) {
      openOrganizations();
      return;
    }
    try {
      const checkoutUrl = await recoverPayment(tenant.globalId);
      setCheckoutIsOpening(true);
      window.location.assign(checkoutUrl);
    } catch {
      setCheckoutIsOpening(false);
      // Keep the created organization selected; payment recovery remains available from its Plans menu.
      openOrganizations();
    }
  };

  if (isPlanSelection && draft) {
    return (
      <Outlet
        context={{
          businessName: draft.details.businessName,
          checkoutIsOpening,
          onBack: () => navigate("/tenants/new"),
          onChoose: choosePlan,
        }}
      />
    );
  }

  return (
    <NarrowContent>
      <TenantDialog
        draft={draft}
        canEdit
        canScheduleDeletion={false}
        onClose={() => navigate("/tenants")}
        onNext={(nextDraft) => {
          setDraft(nextDraft);
          navigate("/tenants/new/plans");
        }}
        onSubmit={async () => null}
        onLogoUpload={stores.tenantStore.uploadLogo}
        onLogoDelete={stores.tenantStore.deleteLogo}
        onScheduleDeletion={() => undefined}
      />
    </NarrowContent>
  );
};

export default observer(OrganizationCreationPage);
