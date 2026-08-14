import TeamsGrid from "@/features/teams/components/TeamsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface TeamsLocationState {
  currentTeamGlobalId?: string;
}

const TeamsPage = () => {
  usePageTitle("Teams");
  const location = useLocation();
  const { currentTeamGlobalId } = (location.state as TeamsLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Teams",
            titleAction: (
              <HelpPopover helpText="Group employees to assign request steps to multiple people." />
            ),
          },
        ]}
      />
      <TeamsGrid currentTeamGlobalId={currentTeamGlobalId} />
    </>
  );
};

export default observer(TeamsPage);
