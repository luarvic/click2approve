import { stores } from "@/app/rootStore";
import InboxGrid from "@/features/approvalRequests/components/InboxGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface InboxLocationState {
  currentTaskId?: number;
}

const InboxPage = () => {
  const numberOfUncompletedTasks =
    stores.approvalRequestTaskStore.numberOfUncompletedTasks;
  const pageTitle =
    numberOfUncompletedTasks > 0
      ? `Inbox (${numberOfUncompletedTasks})`
      : "Inbox";
  usePageTitle(pageTitle);
  const location = useLocation();
  const { currentTaskId } = (location.state as InboxLocationState | null) ?? {};
  return (
    <Box>
      <PageBreadcrumbs items={[{ label: "Inbox" }]} />
      <InboxGrid currentTaskId={currentTaskId} />
    </Box>
  );
};

export default observer(InboxPage);
