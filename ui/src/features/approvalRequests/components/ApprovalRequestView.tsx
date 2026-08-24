import { stores } from "@/app/rootStore";
import ApprovalRequestActionBar from "@/features/approvalRequests/components/ApprovalRequestActionBar";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import ApprovalRequestDiscussionSection from "@/features/approvalRequests/components/ApprovalRequestDiscussionSection";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import { hasIncompleteBusinessParticipantName } from "@/features/approvalRequests/utils/participantName";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { BlockOutlined, Replay } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Tab, Tabs } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ApprovalRequestViewProps {
  approvalRequestGlobalId: string;
  onClose: (currentApprovalRequestGlobalId?: string) => void;
  tab: "request" | "chat";
}

const resubmittableApprovalRequestStatuses = [
  ApprovalRequestStatus.Pending,
  ApprovalRequestStatus.Started,
  ApprovalRequestStatus.Completed,
];

const cancelableApprovalRequestStatuses = [ApprovalRequestStatus.Pending, ApprovalRequestStatus.Started];

const ApprovalRequestView: React.FC<ApprovalRequestViewProps> = ({ approvalRequestGlobalId, onClose, tab }) => {
  const navigate = useNavigate();
  const approvalRequest = stores.approvalRequestStore.currentApprovalRequest;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const nameWarning = getIncompleteParticipantNameWarning(stores.tenantStore.currentTenant?.type);
  const requestsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/requests") : "/";
  const [cancelDialogIsOpen, setCancelDialogIsOpen] = useState(false);
  const [nameWarningDialogIsOpen, setNameWarningDialogIsOpen] = useState(false);
  const cancelLoader = ActionLoaders.approvalRequests.cancel(approvalRequest?.globalId);
  const cancelAction = useAsyncAction(cancelLoader);
  const canResubmit = Boolean(
    approvalRequest &&
    stores.applicationConfigurationStore.approvalRequestRevisionsAreEnabled &&
    !approvalRequest.nextRevisionApprovalRequestGlobalId &&
    resubmittableApprovalRequestStatuses.includes(approvalRequest.status) &&
    approvalRequest.result !== true,
  );
  const canCancel = Boolean(
    approvalRequest && tenantGlobalId && cancelableApprovalRequestStatuses.includes(approvalRequest.status),
  );
  const canSendDiscussion =
    approvalRequest?.status !== ApprovalRequestStatus.Completed &&
    approvalRequest?.steps.some((step) =>
      step.tasks?.some((task) => task.status === ApprovalRequestTaskStatus.Pending),
    ) === true;
  const discussionsAreEnabled = stores.applicationConfigurationStore.discussionsAreEnabled;
  const discussionAttachmentsAreEnabled = stores.applicationConfigurationStore.discussionAttachmentsAreEnabled;
  const approvalRequestIsCanceling = cancelAction.isRunning || stores.commonStore.isActionLoading(cancelLoader);

  const navigateToTab = (value: ApprovalRequestViewProps["tab"]) => {
    if (!tenantGlobalId) return;
    navigate(
      Routes.tenantPath(
        tenantGlobalId,
        `/requests/${approvalRequestGlobalId}${value === "request" ? "" : `/${value}`}`,
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
      tenantGlobalId ? Routes.tenantPath(tenantGlobalId, `/requests/${approvalRequest.globalId}/resubmit`) : "/",
    );
  };

  const cancel = async (): Promise<boolean> => {
    if (!approvalRequest || !tenantGlobalId) {
      return false;
    }

    const isCanceled = await cancelAction.run(async () => {
      const canceled = await stores.approvalRequestStore.cancel(tenantGlobalId, approvalRequest.globalId);
      if (canceled) {
        showPersistenceSuccessNotification(PersistenceSuccessMessages.approvalRequestCanceled);
      }
      return canceled;
    });
    return isCanceled === true;
  };

  const handleCancel = async (): Promise<boolean> => {
    if (hasIncompleteBusinessParticipantName(stores.tenantStore.currentTenant, stores.userProfileStore.profile)) {
      setCancelDialogIsOpen(false);
      setNameWarningDialogIsOpen(true);
      return false;
    }

    return cancel();
  };

  if (tab === "chat" && !discussionsAreEnabled) {
    return <NotFoundPage />;
  }

  return (
    <CloseOnEscape onClose={handleClose}>
      <PageBreadcrumbs
        items={[
          {
            label: "Requests",
            state: approvalRequest ? { currentApprovalRequestGlobalId: approvalRequest.globalId } : undefined,
            to: requestsPath,
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
        onChange={(_, value: ApprovalRequestViewProps["tab"]) => navigateToTab(value)}
        aria-label="Request sections"
      >
        <Tab label="Request" value="request" />
        {discussionsAreEnabled && <Tab label="Chat" value="chat" />}
      </Tabs>
      {tab === "request" && (
        <>
          <ApprovalRequestDetails
            approvalRequest={approvalRequest}
            taskAttachmentsTenantGlobalId={
              stores.applicationConfigurationStore.taskAttachmentsAreEnabled ? (tenantGlobalId ?? undefined) : undefined
            }
          />
          <ApprovalRequestActionBar onClose={handleClose}>
            {canCancel && (
              <LoadingButton
                color="warning"
                loading={approvalRequestIsCanceling}
                startIcon={<BlockOutlined />}
                variant="outlined"
                onClick={() => setCancelDialogIsOpen(true)}
              >
                Cancel request
              </LoadingButton>
            )}
            {canResubmit && (
              <MainActionButton startIcon={<Replay />} onClick={handleResubmit}>
                Resubmit
              </MainActionButton>
            )}
          </ApprovalRequestActionBar>
        </>
      )}
      {tab === "chat" && discussionsAreEnabled && approvalRequest && (
        <ApprovalRequestDiscussionSection
          attachmentsAreEnabled={discussionAttachmentsAreEnabled}
          approvalRequest={approvalRequest}
          canSend={canSendDiscussion}
          onClose={handleClose}
          tenantGlobalId={tenantGlobalId}
        />
      )}
      {approvalRequest && (
        <ConfirmationDialog
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
