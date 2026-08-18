import { stores } from "@/app/rootStore";
import InboxGrid from "@/features/approvalRequests/components/InboxGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface InboxLocationState {
  currentTaskGlobalId?: string;
}

const InboxPage = () => {
  const numberOfUncompletedTasks = stores.approvalRequestTaskStore.numberOfUncompletedTasks;
  const pageTitle = numberOfUncompletedTasks > 0 ? `Inbox (${numberOfUncompletedTasks})` : "Inbox";
  usePageTitle(pageTitle);
  const location = useLocation();
  const { currentTaskGlobalId } = (location.state as InboxLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Inbox",
            titleAction: <HelpPopover helpText="Review and complete tasks assigned to you." />,
          },
        ]}
      />
      <InboxGrid currentTaskGlobalId={currentTaskGlobalId} />
    </>
  );
};

export default observer(InboxPage);
