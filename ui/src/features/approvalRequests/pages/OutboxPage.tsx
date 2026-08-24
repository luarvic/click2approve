import OutboxGrid from "@/features/approvalRequests/components/OutboxGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface OutboxLocationState {
  currentApprovalRequestGlobalId?: string;
}

const OutboxPage = () => {
  usePageTitle("Requests");
  const location = useLocation();
  const { currentApprovalRequestGlobalId } = (location.state as OutboxLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Requests",
            titleAction: <HelpPopover helpText="Track requests you created and their progress." />,
          },
        ]}
      />
      <OutboxGrid currentApprovalRequestGlobalId={currentApprovalRequestGlobalId} />
    </>
  );
};

export default observer(OutboxPage);
