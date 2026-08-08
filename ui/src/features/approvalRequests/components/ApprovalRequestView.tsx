import { stores } from "@/app/rootStore";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import { createSharedVerificationLinkForRequest } from "@/features/sharedVerificationLinks/api/sharedVerificationLinksApi";
import SharedVerificationLinksPanel from "@/features/sharedVerificationLinks/components/SharedVerificationLinksPanel";
import { TenantType } from "@/features/tenants/models/tenant";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { PersistenceSuccessMessages, showPersistenceSuccessToast } from "@/shared/utils/toasts";
import { BlockOutlined, LinkOutlined, Replay } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
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
  ApprovalRequestStatus.Completed,
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
  const nameWarning = getIncompleteParticipantNameWarning(stores.tenantStore.currentTenant?.type);
  const outboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/outbox") : "/";
  const [selectedTab, setSelectedTab] = useState("request");
  const [cancelDialogIsOpen, setCancelDialogIsOpen] = useState(false);
  const [nameWarningDialogIsOpen, setNameWarningDialogIsOpen] = useState(false);
  const [hasSharedVerificationLink, setHasSharedVerificationLink] = useState(false);
  const [sharedVerificationLinksRefreshKey, setSharedVerificationLinksRefreshKey] = useState(0);
  const cancelLoader = ActionLoaders.approvalRequests.cancel(approvalRequest?.globalId);
  const cancelAction = useAsyncAction(cancelLoader);
  const createSharedVerificationLinkLoader = ActionLoaders.sharedVerificationLinks.createForRequest(
    approvalRequest?.globalId,
  );
  const createSharedVerificationLinkAction = useAsyncAction(createSharedVerificationLinkLoader);
  const canResubmit = Boolean(
    approvalRequest &&
    stores.applicationConfigurationStore.approvalRequestRevisionsAreEnabled &&
    !approvalRequest.nextRevisionApprovalRequestGlobalId &&
    resubmittableApprovalRequestStatuses.includes(approvalRequest.status) &&
    approvalRequest.result !== true,
  );
  const canCancel = Boolean(
    approvalRequest &&
    tenantGlobalId &&
    cancelableApprovalRequestStatuses.includes(approvalRequest.status),
  );
  const canManageSharedVerificationLinks = Boolean(
    approvalRequest &&
    stores.applicationConfigurationStore.sharedVerificationLinksAreEnabled &&
    approvalRequest.status === ApprovalRequestStatus.Completed &&
    approvalRequest.result === true,
  );
  const approvalRequestIsCanceling =
    cancelAction.isRunning ||
    stores.commonStore.isActionLoading(cancelLoader);
  const sharedVerificationLinkIsCreating =
    createSharedVerificationLinkAction.isRunning ||
    stores.commonStore.isActionLoading(createSharedVerificationLinkLoader);

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

  const cancel = async (): Promise<boolean> => {
    if (!approvalRequest || !tenantGlobalId) {
      return false;
    }

    const isCanceled = await cancelAction.run(async () => {
      const canceled = await stores.approvalRequestStore.cancel(tenantGlobalId, approvalRequest.globalId);
      if (canceled) {
        showPersistenceSuccessToast(PersistenceSuccessMessages.approvalRequestCanceled);
      }
      return canceled;
    });
    return isCanceled === true;
  };

  const handleCancel = async (): Promise<boolean> => {
    const currentTenant = stores.tenantStore.currentTenant;
    const firstName = currentTenant?.type === TenantType.Business
      ? currentTenant.currentEmployeeFirstName
      : stores.userProfileStore.profile?.firstName;
    const lastName = currentTenant?.type === TenantType.Business
      ? currentTenant.currentEmployeeLastName
      : stores.userProfileStore.profile?.lastName;
    if (!firstName?.trim() || !lastName?.trim()) {
      setCancelDialogIsOpen(false);
      setNameWarningDialogIsOpen(true);
      return false;
    }

    return cancel();
  };

  const handleCreateSharedVerificationLink = async () => {
    if (!approvalRequest || !tenantGlobalId || hasSharedVerificationLink) {
      return;
    }

    await createSharedVerificationLinkAction.run(async () => {
      const linkGlobalId = await createSharedVerificationLinkForRequest(tenantGlobalId, approvalRequest.globalId);
      if (linkGlobalId) {
        await navigator.clipboard?.writeText(`${window.location.origin}/app/verification/${linkGlobalId}`);
        showPersistenceSuccessToast(PersistenceSuccessMessages.sharedVerificationLinkCreated);
        setSharedVerificationLinksRefreshKey((current) => current + 1);
      }
    });
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
          <LoadingButton
            color="warning"
            loading={approvalRequestIsCanceling}
            startIcon={<BlockOutlined />}
            variant="outlined"
            onClick={() => setCancelDialogIsOpen(true)}
          >
            Cancel
          </LoadingButton>
        )}
        {selectedTab === "link" && canManageSharedVerificationLinks && (
          <LoadingButton
            disabled={hasSharedVerificationLink || sharedVerificationLinkIsCreating}
            loading={sharedVerificationLinkIsCreating}
            startIcon={<LinkOutlined />}
            variant="outlined"
            onClick={handleCreateSharedVerificationLink}
          >
            Create link
          </LoadingButton>
        )}
      </Stack>
      {approvalRequest && (
        <ConfirmationDialog
          cancelFirst
          cancelLabel="No"
          confirmColor="warning"
          confirmDisabled={approvalRequestIsCanceling}
          confirmLabel="Yes"
          message={`Are you sure you want to cancel ${approvalRequest.title}?`}
          open={cancelDialogIsOpen}
          title="Cancel request"
          onClose={() => setCancelDialogIsOpen(false)}
          onConfirm={handleCancel}
        />
      )}
      <ConfirmationDialog
        cancelFirst
        cancelLabel="Go back"
        confirmLabel="Proceed anyway"
        message={nameWarning.message}
        open={nameWarningDialogIsOpen}
        title={nameWarning.title}
        onClose={() => setNameWarningDialogIsOpen(false)}
        onConfirm={cancel}
      />
    </>
  );
};

export default observer(ApprovalRequestView);
