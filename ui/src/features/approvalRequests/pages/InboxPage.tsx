import { stores } from "@/app/rootStore";
import InboxGrid from "@/features/approvalRequests/components/InboxGrid";
import { Pages } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface InboxLocationState {
  currentTaskId?: number;
}

const InboxPage = () => {
  const numberOfUncompletedTasks =
    stores.approvalRequestTaskStore.numberOfUncompletedTasks;
  usePageTitle(`Inbox (${numberOfUncompletedTasks})`);
  const location = useLocation();
  const { currentTaskId } = (location.state as InboxLocationState | null) ?? {};
  return (
    <Box>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Inbox
      </Typography>
      <InboxGrid currentTaskId={currentTaskId} />
    </Box>
  );
};

export default observer(InboxPage);
