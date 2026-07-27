import { stores } from "@/app/rootStore";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import ApprovalRequestLog from "@/features/approvalRequests/components/ApprovalRequestLog";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { Dialogs, Pages, Routes } from "@/shared/constants/constants";
import { Replay } from "@mui/icons-material";
import {
  Button,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ApprovalRequestViewProps {
  onClose: (currentApprovalRequestId?: number) => void;
}

const resubmittableApprovalRequestStatuses = [
  ApprovalRequestStatus.Pending,
  ApprovalRequestStatus.Started,
  ApprovalRequestStatus.Rejected,
];

const ApprovalRequestView: React.FC<ApprovalRequestViewProps> = ({
  onClose,
}) => {
  const navigate = useNavigate();
  const approvalRequest = stores.approvalRequestStore.currentApprovalRequest;
  const [selectedTab, setSelectedTab] = useState("request");
  const canResubmit = Boolean(
    approvalRequest &&
    stores.productStore.approvalRequestRevisionsAreEnabled &&
    !approvalRequest.nextRevisionApprovalRequestId &&
    resubmittableApprovalRequestStatuses.includes(approvalRequest.status),
  );

  useEffect(() => {
    setSelectedTab("request");
  }, [approvalRequest]);

  const handleClose = () => {
    onClose(approvalRequest?.id);
  };

  const handleResubmit = () => {
    if (!approvalRequest) {
      return;
    }

    const tenantId = stores.tenantStore.currentTenantId;
    navigate(
      tenantId
        ? Routes.tenantPath(tenantId, `/outbox/${approvalRequest.id}/resubmit`)
        : "/",
    );
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
      {selectedTab === "request" && <ApprovalRequestDetails approvalRequest={approvalRequest} />}
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
        {canResubmit && (
          <Button startIcon={<Replay />} variant="outlined" onClick={handleResubmit}>
            Resubmit
          </Button>
        )}
      </Stack>
    </>
  );
};

export default observer(ApprovalRequestView);
