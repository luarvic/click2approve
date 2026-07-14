import OutboxGrid from "@/features/approvalRequests/components/OutboxGrid";
import { Pages } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface OutboxLocationState {
  currentApprovalRequestId?: number;
}

const OutboxPage = () => {
  usePageTitle("Outbox");
  const location = useLocation();
  const { currentApprovalRequestId } = (location.state as OutboxLocationState | null) ?? {};
  return (
    <Box>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Outbox
      </Typography>
      <OutboxGrid currentApprovalRequestId={currentApprovalRequestId} />
    </Box>
  );
};

export default observer(OutboxPage);
