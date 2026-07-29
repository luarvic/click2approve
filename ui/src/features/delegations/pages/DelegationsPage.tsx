import DelegationsGrid from "@/features/delegations/components/DelegationsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface DelegationsLocationState {
  currentDelegationGlobalId?: string;
}

const DelegationsPage = () => {
  usePageTitle("Delegations");
  const location = useLocation();
  const { currentDelegationGlobalId } =
    (location.state as DelegationsLocationState | null) ?? {};

  return (
    <>
      <PageBreadcrumbs items={[{ label: "Delegations" }]} />
      <DelegationsGrid currentDelegationGlobalId={currentDelegationGlobalId} />
    </>
  );
};

export default observer(DelegationsPage);
