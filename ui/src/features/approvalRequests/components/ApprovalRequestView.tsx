import { stores } from "@/app/rootStore";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import DiscussionPanel, {
  DiscussionPanelHandle,
} from "@/features/discussions/components/DiscussionPanel";
import { createSharedVerificationLinkForRequest } from "@/features/sharedVerificationLinks/api/sharedVerificationLinksApi";
import SharedVerificationLinksPanel from "@/features/sharedVerificationLinks/components/SharedVerificationLinksPanel";
import { TenantType } from "@/features/tenants/models/tenant";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { BlockOutlined, LinkOutlined, Replay } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Stack, Tab, Tabs } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ApprovalRequestViewProps {
  approvalRequestGlobalId: string;
  onClose: (currentApprovalRequestGlobalId?: string) => void;
  tab: "request" | "chat" | "link";
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
  approvalRequestGlobalId,
  onClose,
  tab,
}) => {
  const navigate = useNavigate();
  const approvalRequest = stores.approvalRequestStore.currentApprovalRequest;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const nameWarning = getIncompleteParticipantNameWarning(
    stores.tenantStore.currentTenant?.type,
  );
  const outboxPath = tenantGlobalId
    ? Routes.tenantPath(tenantGlobalId, "/outbox")
    : "/";
  const [cancelDialogIsOpen, setCancelDialogIsOpen] = useState(false);
  const [nameWarningDialogIsOpen, setNameWarningDialogIsOpen] = useState(false);
  const [hasSharedVerificationLink, setHasSharedVerificationLink] =
    useState(false);
  const [
    sharedVerificationLinksRefreshKey,
    setSharedVerificationLinksRefreshKey,
  ] = useState(0);
  const discussionPanel = useRef<DiscussionPanelHandle>(null);
  const cancelLoader = ActionLoaders.approvalRequests.cancel(
    approvalRequest?.globalId,
  );
  const cancelAction = useAsyncAction(cancelLoader);
  const createSharedVerificationLinkLoader =
    ActionLoaders.sharedVerificationLinks.createForRequest(
      approvalRequest?.globalId,
    );
  const createSharedVerificationLinkAction = useAsyncAction(
    createSharedVerificationLinkLoader,
  );
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
  const canSendDiscussion =
    approvalRequest?.status !== ApprovalRequestStatus.Completed &&
    approvalRequest?.steps.some((step) =>
      step.tasks?.some(
        (task) => task.status === ApprovalRequestTaskStatus.Pending,
      ),
    ) === true;
  const discussionsAreEnabled =
    stores.applicationConfigurationStore.discussionsAreEnabled;
  const discussionAttachmentsAreEnabled =
    stores.applicationConfigurationStore.discussionAttachmentsAreEnabled;
  const approvalRequestIsCanceling =
    cancelAction.isRunning || stores.commonStore.isActionLoading(cancelLoader);
  const sharedVerificationLinkIsCreating =
    createSharedVerificationLinkAction.isRunning ||
    stores.commonStore.isActionLoading(createSharedVerificationLinkLoader);

  const navigateToTab = (value: ApprovalRequestViewProps["tab"]) => {
    if (!tenantGlobalId) return;
    navigate(
      Routes.tenantPath(
        tenantGlobalId,
        `/outbox/${approvalRequestGlobalId}${value === "request" ? "" : `/${value}`}`,
      ),
    );
  };

  const handleClose = () => {
    onClose(approvalRequest?.globalId);
  };

  const handleResubmit = () => {
    if (!approvalRequest) {
      return;
    }

    navigate(
      tenantGlobalId
        ? Routes.tenantPath(
          tenantGlobalId,
          `/outbox/${approvalRequest.globalId}/resubmit`,
        )
        : "/",
    );
  };

  const cancel = async (): Promise<boolean> => {
    if (!approvalRequest || !tenantGlobalId) {
      return false;
    }

    const isCanceled = await cancelAction.run(async () => {
      const canceled = await stores.approvalRequestStore.cancel(
        tenantGlobalId,
        approvalRequest.globalId,
      );
      if (canceled) {
        showPersistenceSuccessNotification(
          PersistenceSuccessMessages.approvalRequestCanceled,
        );
      }
      return canceled;
    });
    return isCanceled === true;
  };

  const handleCancel = async (): Promise<boolean> => {
    const currentTenant = stores.tenantStore.currentTenant;
    const firstName =
      currentTenant?.type === TenantType.Business
        ? currentTenant.currentEmployeeFirstName
        : stores.userProfileStore.profile?.firstName;
    const lastName =
      currentTenant?.type === TenantType.Business
        ? currentTenant.currentEmployeeLastName
        : stores.userProfileStore.profile?.lastName;
    if (
      (!firstName?.trim() || !lastName?.trim()) &&
      currentTenant?.type === TenantType.Business
    ) {
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
      const linkGlobalId = await createSharedVerificationLinkForRequest(
        tenantGlobalId,
        approvalRequest.globalId,
      );
      if (linkGlobalId) {
        await navigator.clipboard?.writeText(
          `${window.location.origin}/app/verification/${linkGlobalId}`,
        );
        showPersistenceSuccessNotification(
          PersistenceSuccessMessages.sharedVerificationLinkCreated,
        );
        setSharedVerificationLinksRefreshKey((current) => current + 1);
      }
    });
  };

  if (
    (tab === "chat" && !discussionsAreEnabled) ||
    (tab === "link" && approvalRequest && !canManageSharedVerificationLinks)
  ) {
    return <NotFoundPage />;
  }

  return (
    <CloseOnEscape onClose={handleClose}>
      <PageBreadcrumbs
        items={[
          {
            label: "Outbox",
            state: approvalRequest
              ? { currentApprovalRequestGlobalId: approvalRequest.globalId }
              : undefined,
            to: outboxPath,
          },
          {
            label: `Request ${getApprovalRequestNumber(approvalRequest?.globalId)}`,
          },
        ]}
      />
      <Tabs
        scrollButtons={false}
        value={tab}
        variant="scrollable"
        onChange={(_, value: ApprovalRequestViewProps["tab"]) =>
          navigateToTab(value)
        }
        aria-label="Request sections"
      >
        <Tab label="Request" value="request" />
        {discussionsAreEnabled && <Tab label="Chat" value="chat" />}
        {canManageSharedVerificationLinks && <Tab label="Link" value="link" />}
      </Tabs>
      {tab === "request" && (
        <>
          <ApprovalRequestDetails
            approvalRequest={approvalRequest}
            taskAttachmentsTenantGlobalId={
              stores.applicationConfigurationStore.taskAttachmentsAreEnabled
                ? tenantGlobalId ?? undefined
                : undefined
            }
          />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={Dialogs.stepHeaderSpacing}
            sx={Dialogs.addStepButtonSx}
          >
            <Button variant="outlined" onClick={handleClose}>
              Close
            </Button>
            {canResubmit && (
              <Button
                startIcon={<Replay />}
                variant="outlined"
                onClick={handleResubmit}
              >
                Resubmit
              </Button>
            )}
            {canCancel && (
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
          </Stack>
        </>
      )}
      {tab === "chat" && discussionsAreEnabled && approvalRequest && (
        <>
            <DiscussionPanel
              attachmentsAreEnabled={discussionAttachmentsAreEnabled}
            canSend={canSendDiscussion}
            ref={discussionPanel}
            requestGlobalId={approvalRequest.globalId}
            requesterDisplayName={approvalRequest.createdByDisplayName}
            requesterEmail={approvalRequest.createdByEmail}
            requesterType={approvalRequest.createdByEmployeeGlobalId
              ? AssigneeType.Employee
              : AssigneeType.User}
            stepLabels={Object.fromEntries(
              approvalRequest.steps
                .filter((step) => step.globalId)
                .map((step) => [step.globalId!, `Step ${step.sequence}`]),
            )}
            steps={approvalRequest.steps}
            tenantGlobalId={tenantGlobalId}
          />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={Dialogs.stepHeaderSpacing}
            sx={Dialogs.addStepButtonSx}
          >
            <Button variant="outlined" onClick={handleClose}>
              Close
            </Button>
            {canSendDiscussion && (
              <Button
                variant="outlined"
                onClick={() => void discussionPanel.current?.send()}
              >
                Send
              </Button>
            )}
          </Stack>
        </>
      )}
      {tab === "link" && canManageSharedVerificationLinks && (
        <SharedVerificationLinksPanel
          approvalRequestGlobalId={approvalRequest?.globalId}
          onHasLinkChange={setHasSharedVerificationLink}
          refreshKey={sharedVerificationLinksRefreshKey}
          tenantGlobalId={tenantGlobalId}
        />
      )}
      {tab === "link" && canManageSharedVerificationLinks && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={Dialogs.stepHeaderSpacing}
            sx={Dialogs.addStepButtonSx}
          >
            <Button variant="outlined" onClick={handleClose}>
              Close
            </Button>
            <LoadingButton
              disabled={
                hasSharedVerificationLink || sharedVerificationLinkIsCreating
              }
              loading={sharedVerificationLinkIsCreating}
              startIcon={<LinkOutlined />}
              variant="outlined"
              onClick={handleCreateSharedVerificationLink}
            >
              Create link
            </LoadingButton>
          </Stack>
      )}
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
      {nameWarning && (
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
      )}
    </CloseOnEscape>
  );
};

export default observer(ApprovalRequestView);
