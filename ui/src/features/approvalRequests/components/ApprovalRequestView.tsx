import { stores } from "@/app/rootStore";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import ApprovalRequestLog from "@/features/approvalRequests/components/ApprovalRequestLog";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import { PersistenceSuccessMessages, showPersistenceSuccessToast } from "@/shared/utils/toasts";
import { BlockOutlined, Replay } from "@mui/icons-material";
import {
  Button,
  Stack,
  Tab,
  Tabs,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ApprovalRequestViewProps {
  onClose: (currentApprovalRequestGlobalId?: string) => void;
}

const resubmittableApprovalRequestStatuses = [
  ApprovalRequestStatus.Pending,
  ApprovalRequestStatus.Started,
  ApprovalRequestStatus.Rejected,
];

const cancelableApprovalRequestStatuses = [
  ApprovalRequestStatus.Pending,
  ApprovalRequestStatus.Started,
];

const ApprovalRequestView: React.FC<ApprovalRequestViewProps> = ({
  onClose,
}) => {
  const navigate = useNavigate();
  const approvalRequest = stores.approvalRequestStore.currentApprovalRequest;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const outboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/outbox") : "/";
  const [selectedTab, setSelectedTab] = useState("request");
  const [cancelDialogIsOpen, setCancelDialogIsOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const canResubmit = Boolean(
    approvalRequest &&
    stores.productStore.approvalRequestRevisionsAreEnabled &&
    !approvalRequest.nextRevisionApprovalRequestGlobalId &&
    resubmittableApprovalRequestStatuses.includes(approvalRequest.status),
  );
  const canCancel = Boolean(
    approvalRequest &&
    tenantGlobalId &&
    cancelableApprovalRequestStatuses.includes(approvalRequest.status),
  );

  useEffect(() => {
    setSelectedTab("request");
  }, [approvalRequest]);

  const handleClose = () => {
    onClose(approvalRequest?.globalId);
  };

  const handleResubmit = () => {
    if (!approvalRequest) {
      return;
    }

    navigate(
      tenantGlobalId
        ? Routes.tenantPath(tenantGlobalId, `/outbox/${approvalRequest.globalId}/resubmit`)
        : "/",
    );
  };

  const handleCancel = async (): Promise<boolean> => {
    if (!approvalRequest || !tenantGlobalId) {
      return false;
    }

    setIsCanceling(true);
    const isCanceled = await stores.approvalRequestStore
      .cancel(tenantGlobalId, approvalRequest.globalId)
      .finally(() => setIsCanceling(false));

    if (isCanceled) {
      showPersistenceSuccessToast(PersistenceSuccessMessages.approvalRequestCanceled);
    }

    return isCanceled;
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Outbox",
            state: approvalRequest ? { currentApprovalRequestGlobalId: approvalRequest.globalId } : undefined,
            to: outboxPath,
          },
          { label: "Request" },
        ]}
      />
      <Tabs
        value={selectedTab}
        onChange={(_, value: string) => setSelectedTab(value)}
        aria-label="Request sections"
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
        {canCancel && (
          <Button
            color="warning"
            disabled={isCanceling}
            startIcon={<BlockOutlined />}
            variant="outlined"
            onClick={() => setCancelDialogIsOpen(true)}
          >
            Cancel
          </Button>
        )}
      </Stack>
      {approvalRequest && (
        <ConfirmationDialog
          cancelFirst
          cancelLabel="No"
          confirmColor="warning"
          confirmDisabled={isCanceling}
          confirmLabel="Yes"
          message={`Are you sure you want to cancel ${approvalRequest.title}?`}
          open={cancelDialogIsOpen}
          title="Cancel request"
          onClose={() => setCancelDialogIsOpen(false)}
          onConfirm={handleCancel}
        />
      )}
    </>
  );
};

export default observer(ApprovalRequestView);
