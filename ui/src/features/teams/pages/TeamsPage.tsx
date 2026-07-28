import TeamsGrid from "@/features/teams/components/TeamsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface TeamsLocationState {
  currentTeamId?: number;
}

const TeamsPage = () => {
  usePageTitle("Teams");
  const location = useLocation();
  const { currentTeamId } = (location.state as TeamsLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Teams" }]} />
      <TeamsGrid currentTeamId={currentTeamId} />
    </>
  );
};

export default observer(TeamsPage);
