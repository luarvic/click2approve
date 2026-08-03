import { stores } from "@/app/rootStore";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { createSharedVerificationLinkForRequest } from "@/features/sharedVerificationLinks/api/sharedVerificationLinksApi";
import SharedVerificationLinksPanel from "@/features/sharedVerificationLinks/components/SharedVerificationLinksPanel";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import { PersistenceSuccessMessages, showPersistenceSuccessToast } from "@/shared/utils/toasts";
import { BlockOutlined, LinkOutlined, Replay } from "@mui/icons-material";
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
  const [hasSharedVerificationLink, setHasSharedVerificationLink] = useState(false);
  const [isCreatingSharedVerificationLink, setIsCreatingSharedVerificationLink] = useState(false);
  const [sharedVerificationLinksRefreshKey, setSharedVerificationLinksRefreshKey] = useState(0);
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
  const canManageSharedVerificationLinks = Boolean(
    approvalRequest &&
    stores.productStore.sharedVerificationLinksAreEnabled &&
    approvalRequest.status === ApprovalRequestStatus.Approved,
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

  const handleCreateSharedVerificationLink = async () => {
    if (!approvalRequest || !tenantGlobalId || hasSharedVerificationLink) {
      return;
    }

    setIsCreatingSharedVerificationLink(true);
    const linkGlobalId = await createSharedVerificationLinkForRequest(tenantGlobalId, approvalRequest.globalId)
      .finally(() => setIsCreatingSharedVerificationLink(false));
    if (linkGlobalId) {
      await navigator.clipboard?.writeText(`${window.location.origin}/app/verification/${linkGlobalId}`);
      showPersistenceSuccessToast(PersistenceSuccessMessages.sharedVerificationLinkCreated);
      setSharedVerificationLinksRefreshKey((current) => current + 1);
    }
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
        {canManageSharedVerificationLinks && <Tab label="Link" value="link" />}
      </Tabs>
      {selectedTab === "request" && <ApprovalRequestDetails approvalRequest={approvalRequest} />}
      {selectedTab === "link" && canManageSharedVerificationLinks && (
        <SharedVerificationLinksPanel
          approvalRequestGlobalId={approvalRequest?.globalId}
          onHasLinkChange={setHasSharedVerificationLink}
          refreshKey={sharedVerificationLinksRefreshKey}
          tenantGlobalId={tenantGlobalId}
        />
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={Dialogs.stepHeaderSpacing}
        sx={Dialogs.addStepButtonSx}
      >
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
        {selectedTab === "request" && canResubmit && (
          <Button startIcon={<Replay />} variant="outlined" onClick={handleResubmit}>
            Resubmit
          </Button>
        )}
        {selectedTab === "request" && canCancel && (
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
        {selectedTab === "link" && canManageSharedVerificationLinks && (
          <Button
            disabled={hasSharedVerificationLink || isCreatingSharedVerificationLink}
            startIcon={<LinkOutlined />}
            variant="outlined"
            onClick={handleCreateSharedVerificationLink}
          >
            Create link
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
