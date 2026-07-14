import TeamsGrid from "@/features/teams/components/TeamsGrid";
import { Pages } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Typography } from "@mui/material";
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
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Teams
      </Typography>
      <TeamsGrid currentTeamId={currentTeamId} />
    </>
  );
};

export default observer(TeamsPage);
