import { stores } from "@/app/rootStore";
import { cancelApprovalRequest } from "@/features/approvalRequests/api/approvalRequestsApi";
import ApprovalRequestLog from "@/features/approvalRequests/components/ApprovalRequestLog";
import ApprovalRequestSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestSummaryBlock";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import { Dialogs, Pages } from "@/shared/constants/constants";
import {
  Button,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

interface ApprovalRequestViewProps {
  onClose: (currentApprovalRequestId?: number) => void;
  onClone: () => void;
}

const ApprovalRequestView: React.FC<ApprovalRequestViewProps> = ({
  onClose,
  onClone,
}) => {
  const approvalRequest = stores.approvalRequestStore.currentApprovalRequest;
  const [selectedTab, setSelectedTab] = useState("request");

  useEffect(() => {
    setSelectedTab("request");
  }, [approvalRequest]);

  const handleClose = () => {
    onClose(approvalRequest?.id);
  };

  const handleClone = () => {
    if (!approvalRequest) {
      return;
    }
    stores.approvalRequestStore.setRequestToClone(approvalRequest);
    onClone();
  };

  const handleCancelRequest = async () => {
    if (!approvalRequest) {
      return;
    }
    const tenantId = stores.tenantStore.currentTenantId;
    if (!tenantId) {
      return;
    }

    if (await cancelApprovalRequest(tenantId, approvalRequest.id)) {
      stores.approvalRequestStore.clear();
      onClose(approvalRequest.id);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Approval request
      </Typography>
      <Tabs
        value={selectedTab}
        onChange={(_, value: string) => setSelectedTab(value)}
        aria-label="Approval request sections"
      >
        <Tab label="Request" value="request" />
        <Tab label="Log" value="log" />
      </Tabs>
      {selectedTab === "request" && (
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
          {approvalRequest && (
            <ApprovalSteps
              approvalRequest={approvalRequest}
              leadingItem={<ApprovalRequestSummaryBlock approvalRequest={approvalRequest} />}
              showDividers
            />
          )}
        </Stack>
      )}
      {selectedTab === "log" && (
        <ApprovalRequestLog approvalRequest={approvalRequest} />
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={Dialogs.stepHeaderSpacing}
        sx={Dialogs.addStepButtonSx}
      >
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
        <Button variant="outlined" onClick={handleClone}>
          Clone
        </Button>
        {(approvalRequest?.status === ApprovalRequestStatus.Pending ||
          approvalRequest?.status === ApprovalRequestStatus.Started) && (
            <Button variant="outlined" onClick={handleCancelRequest}>
              Cancel request
            </Button>
          )}
      </Stack>
    </>
  );
};

export default observer(ApprovalRequestView);
