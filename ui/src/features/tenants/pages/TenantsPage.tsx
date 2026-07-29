import TenantsGrid from "@/features/tenants/components/TenantsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface TenantsLocationState {
  currentTenantGlobalId?: string;
}

const TenantsPage = () => {
  usePageTitle("Organizations");
  const location = useLocation();
  const { currentTenantGlobalId } = (location.state as TenantsLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Organizations" }]} />
      <TenantsGrid currentTenantGlobalId={currentTenantGlobalId} />
    </>
  );
};

export default observer(TenantsPage);
