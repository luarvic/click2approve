import TenantsGrid from "@/features/tenants/components/TenantsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface TenantsLocationState {
  currentTenantId?: number;
}

const TenantsPage = () => {
  usePageTitle("Organizations");
  const location = useLocation();
  const { currentTenantId } = (location.state as TenantsLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Organizations" }]} />
      <TenantsGrid currentTenantId={currentTenantId} />
    </>
  );
};

export default observer(TenantsPage);
