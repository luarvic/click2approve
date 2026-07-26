import DelegationsGrid from "@/features/delegations/components/DelegationsGrid";
import { Pages } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface DelegationsLocationState {
  currentDelegationId?: number;
}

const DelegationsPage = () => {
  usePageTitle("Delegations");
  const location = useLocation();
  const { currentDelegationId } =
    (location.state as DelegationsLocationState | null) ?? {};

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Delegations
      </Typography>
      <DelegationsGrid currentDelegationId={currentDelegationId} />
    </>
  );
};

export default observer(DelegationsPage);
