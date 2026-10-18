import RequestsGrid from "@/features/approvalRequests/components/RequestsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface RequestsLocationState {
  currentApprovalRequestGlobalId?: string;
}

const RequestsPage = () => {
  usePageTitle("Requests");
  const location = useLocation();
  const { currentApprovalRequestGlobalId } = (location.state as RequestsLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Requests",
            titleAction: (
              <HelpPopover
                docsHref="/docs/track-requests/"
                helpText="Track accessible requests and their progress in the selected workspace."
              />
            ),
          },
        ]}
      />
      <RequestsGrid currentApprovalRequestGlobalId={currentApprovalRequestGlobalId} />
    </>
  );
};

export default observer(RequestsPage);
