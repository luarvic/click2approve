import { stores } from "@/app/rootStore";
import InboxGrid from "@/features/approvalRequests/components/InboxGrid";
import { Pages } from "@/shared/constants/constants";
import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate, useLocation } from "react-router-dom";

interface InboxLocationState {
  currentTaskId?: number;
}

const InboxPage = () => {
  const location = useLocation();
  const { currentTaskId } = (location.state as InboxLocationState | null) ?? {};
  return stores.userAccountStore.currentUser ? (
    <Box>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Incoming Requests
      </Typography>
      <InboxGrid currentTaskId={currentTaskId} />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(InboxPage);
