import OutboxGrid from "@/features/approvalRequests/components/OutboxGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface OutboxLocationState {
  currentApprovalRequestGlobalId?: string;
}

const OutboxPage = () => {
  usePageTitle("Outbox");
  const location = useLocation();
  const { currentApprovalRequestGlobalId } = (location.state as OutboxLocationState | null) ?? {};
  return (
    <Box>
      <PageBreadcrumbs items={[{ label: "Outbox" }]} />
      <OutboxGrid currentApprovalRequestGlobalId={currentApprovalRequestGlobalId} />
    </Box>
  );
};

export default observer(OutboxPage);
