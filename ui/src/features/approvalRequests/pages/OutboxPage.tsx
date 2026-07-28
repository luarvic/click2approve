import OutboxGrid from "@/features/approvalRequests/components/OutboxGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Box } from "@mui/material";
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
      <PageBreadcrumbs items={[{ label: "Outbox" }]} />
      <OutboxGrid currentApprovalRequestId={currentApprovalRequestId} />
    </Box>
  );
};

export default observer(OutboxPage);
