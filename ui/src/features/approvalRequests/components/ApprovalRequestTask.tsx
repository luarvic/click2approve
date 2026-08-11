import { stores } from "@/app/rootStore";
import { completeApprovalRequestTask } from "@/features/approvalRequests/api/approvalRequestTasksApi";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import type { ElectronicSignatureErrors } from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureForm";
import ApprovalRequestElectronicSignatureForm from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureForm";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import { createApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/utils/approvalRequestTaskClientAuditContext";
import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import DiscussionPanel, {
  DiscussionPanelHandle,
} from "@/features/discussions/components/DiscussionPanel";
import { createSharedVerificationLinkForTask } from "@/features/sharedVerificationLinks/api/sharedVerificationLinksApi";
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
import { LinkOutlined } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ApprovalRequestTaskProps {
  onClose: (currentTaskGlobalId?: string) => void;
  tab: "task" | "request" | "chat" | "link";
  taskGlobalId: string;
}

const emptyElectronicSignatureErrors: ElectronicSignatureErrors = {
  legalName: "",
  signature: "",
};

const getDefaultLegalName = (
  isAssigneeEmployee: boolean | undefined,
): string => {
  const currentTenant = stores.tenantStore.currentTenant;
  const firstName = isAssigneeEmployee
    ? currentTenant?.currentEmployeeFirstName
    : stores.userProfileStore.profile?.firstName;
  const lastName = isAssigneeEmployee
    ? currentTenant?.currentEmployeeLastName
    : stores.userProfileStore.profile?.lastName;

  return [firstName, lastName]
    .map((name) => name?.trim())
    .filter((name): name is string => Boolean(name))
    .join(" ");
};

const ApprovalRequestTask: React.FC<ApprovalRequestTaskProps> = ({
  onClose,
  tab,
  taskGlobalId,
}) => {
  const navigate = useNavigate();
  const [decisionError, setDecisionError] = useState(false);
  const [commentError, setCommentError] = useState(false);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [legalName, setLegalName] = useState("");
  const [organization, setOrganization] = useState("");
  const [signatureJson, setSignatureJson] = useState("");
  const [electronicSignatureErrors, setElectronicSignatureErrors] =
    useState<ElectronicSignatureErrors>(emptyElectronicSignatureErrors);
  const [approvalRequest, setApprovalRequest] =
    useState<ApprovalRequest | null>(null);
  const [hasSharedVerificationLink, setHasSharedVerificationLink] =
    useState(false);
  const [
    sharedVerificationLinksRefreshKey,
    setSharedVerificationLinksRefreshKey,
  ] = useState(0);
  const [nameWarningDialogIsOpen, setNameWarningDialogIsOpen] = useState(false);
  const discussionPanel = useRef<DiscussionPanelHandle>(null);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const nameWarning = getIncompleteParticipantNameWarning(
    stores.tenantStore.currentTenant?.type,
  );
  const inboxPath = tenantGlobalId
    ? Routes.tenantPath(tenantGlobalId, "/inbox")
    : "/";
  const currentTask = stores.approvalRequestTaskStore.currentTask;
  const requestTabLabel = approvalRequest
    ? `Request ${getApprovalRequestNumber(approvalRequest.globalId)}`
    : "Request";
  const currentTaskAssigneeType = approvalRequest?.steps
    .find((step) => step.globalId === currentTask?.approvalRequestStepGlobalId)
    ?.assignees.find(
      (assignee) =>
        assignee.globalId === currentTask?.approvalRequestStepAssigneeGlobalId,
    )?.type;
  const discussionStep = approvalRequest?.steps.find(
    (step) => step.globalId === currentTask?.approvalRequestStepGlobalId,
  );
  const canSendDiscussion =
    approvalRequest?.status !== ApprovalRequestStatus.Completed &&
    discussionStep?.tasks?.some(
      (task) => task.status === ApprovalRequestTaskStatus.Pending,
    ) === true;
  const discussionsAreEnabled =
    stores.applicationConfigurationStore.discussionsAreEnabled;
  const isCompleted = Boolean(
    currentTask && currentTask.status !== ApprovalRequestTaskStatus.Pending,
  );
  const actionLabels = getApprovalRequestTaskActionLabels(currentTask?.action);
  const completeTaskLoader = ActionLoaders.approvalRequestTasks.complete(
    currentTask?.globalId,
  );
  const createSharedVerificationLinkLoader =
    ActionLoaders.sharedVerificationLinks.createForTask(currentTask?.globalId);
  const createSharedVerificationLinkAction = useAsyncAction(
    createSharedVerificationLinkLoader,
  );
  const submitAction = useAsyncAction(completeTaskLoader);
  const requiresElectronicSignature =
    currentTask?.action === ApprovalRequestTaskAction.Sign;
  const canEnterAssigneeOrganization = !currentTask?.isAssigneeEmployee;
  const canManageSharedVerificationLinks = Boolean(
    currentTask &&
    stores.applicationConfigurationStore.sharedVerificationLinksAreEnabled &&
    approvalRequest?.status === ApprovalRequestStatus.Completed &&
    approvalRequest.result === true,
  );
  const taskIsSubmitting =
    submitAction.isRunning ||
    stores.commonStore.isActionLoading(completeTaskLoader);
  const sharedVerificationLinkIsCreating =
    createSharedVerificationLinkAction.isRunning ||
    stores.commonStore.isActionLoading(createSharedVerificationLinkLoader);

  useEffect(() => {
    setDecision(
      currentTask?.result === true
        ? "approve"
        : currentTask?.result === false
          ? "reject"
          : "",
    );
    setComment(currentTask?.comment ?? "");
    setLegalName(
      currentTask?.assigneeLegalName?.trim() ||
      getDefaultLegalName(currentTask?.isAssigneeEmployee),
    );
    setOrganization(currentTask?.assigneeOrganization ?? "");
    setSignatureJson(
      currentTask?.assigneeSignatureJson?.trim() ||
      stores.userProfileStore.profile?.defaultSignatureJson ||
      "",
    );
    setElectronicSignatureErrors(emptyElectronicSignatureErrors);
    setApprovalRequest(currentTask?.approvalRequest ?? null);
  }, [currentTask]);

  const navigateToTab = (value: ApprovalRequestTaskProps["tab"]) => {
    if (!tenantGlobalId) return;
    navigate(
      Routes.tenantPath(
        tenantGlobalId,
        `/inbox/${taskGlobalId}${value === "task" ? "" : `/${value}`}`,
      ),
    );
  };

  const cleanUp = () => {
    setDecisionError(false);
    setCommentError(false);
    setDecision("");
    setComment("");
    setLegalName("");
    setOrganization("");
    setSignatureJson("");
    setElectronicSignatureErrors(emptyElectronicSignatureErrors);
  };

  const handleClose = () => {
    cleanUp();
    onClose(currentTask?.globalId);
  };

  const handleSignatureChange = useCallback((value: string) => {
    setSignatureJson(value);
    setElectronicSignatureErrors((current) => ({ ...current, signature: "" }));
  }, []);

  const clearElectronicSignatureError = (
    field: keyof ElectronicSignatureErrors,
  ) => {
    setElectronicSignatureErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateElectronicSignature = (): boolean => {
    const nextErrors: ElectronicSignatureErrors = {
      legalName: legalName.trim() ? "" : "Legal name is required.",
      signature: signatureJson ? "" : "Signature is required.",
    };

    setElectronicSignatureErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const submit = async () => {
    if (isCompleted) return;
    if (!decision) {
      setDecisionError(true);
      return;
    }
    if (!currentTask || !stores.userAccountStore.currentUser) return;
    const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
    if (!tenantGlobalId) return;
    if (decision === "reject" && !comment.trim()) {
      setCommentError(true);
      return;
    }
    if (requiresElectronicSignature) {
      if (!validateElectronicSignature()) {
        return;
      }
    }

    await submitAction.run(async () => {
      const didComplete = await completeApprovalRequestTask(
        tenantGlobalId,
        currentTask.globalId,
        decision === "approve",
        comment,
        requiresElectronicSignature
          ? {
            assigneeLegalName: legalName.trim(),
            assigneeOrganization: canEnterAssigneeOrganization
              ? organization
              : undefined,
            assigneeSignatureJson: signatureJson,
          }
          : undefined,
        createApprovalRequestTaskClientAuditContext(),
      );
      if (didComplete) {
        showPersistenceSuccessNotification(
          PersistenceSuccessMessages.approvalDecisionSubmitted,
        );
        cleanUp();
        stores.approvalRequestTaskStore.clear();
        stores.approvalRequestTaskStore.loadUncompletedCount(tenantGlobalId);
        onClose(currentTask.globalId);
      }
    });
  };

  const handleSubmit = () => {
    if (requiresElectronicSignature) {
      void submit();
      return;
    }

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
      setNameWarningDialogIsOpen(true);
      return;
    }

    void submit();
  };

  const handleCreateSharedVerificationLink = async () => {
    if (!currentTask || !tenantGlobalId || hasSharedVerificationLink) {
      return;
    }

    await createSharedVerificationLinkAction.run(async () => {
      const linkGlobalId = await createSharedVerificationLinkForTask(
        tenantGlobalId,
        currentTask.globalId,
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
    (tab === "link" && currentTask && !canManageSharedVerificationLinks)
  ) {
    return <NotFoundPage />;
  }

  return (
    <CloseOnEscape onClose={handleClose}>
      <PageBreadcrumbs
        items={[
          {
            label: "Inbox",
            state: currentTask
              ? { currentTaskGlobalId: currentTask.globalId }
              : undefined,
            to: inboxPath,
          },
          { label: `Task ${getApprovalRequestNumber(currentTask?.globalId)}` },
        ]}
      />
      <Tabs
        scrollButtons={false}
        value={tab}
        variant="scrollable"
        onChange={(_, value: ApprovalRequestTaskProps["tab"]) =>
          navigateToTab(value)
        }
        aria-label="Task sections"
      >
        <Tab label="Task" value="task" />
        <Tab label={requestTabLabel} value="request" />
        {discussionsAreEnabled && <Tab label="Chat" value="chat" />}
        {canManageSharedVerificationLinks && <Tab label="Link" value="link" />}
      </Tabs>
      {tab === "task" && (
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
          {currentTask && (
            <ApprovalRequestTaskSummaryBlock
              participant="assignee"
              participantType={currentTaskAssigneeType}
              showComment
              showElectronicSignature={requiresElectronicSignature}
              task={currentTask}
            />
          )}
          {!isCompleted && (
            <>
              <FormControl key="decision" error={decisionError}>
                <RadioGroup
                  row
                  name="decision"
                  value={decision}
                  onChange={(event) => {
                    setDecision(event.target.value);
                    setDecisionError(false);
                  }}
                >
                  <FormControlLabel
                    value="approve"
                    control={<Radio />}
                    label={actionLabels.positive}
                  />
                  <FormControlLabel
                    value="reject"
                    control={<Radio />}
                    label={actionLabels.negative}
                  />
                </RadioGroup>
                {decisionError && (
                  <FormHelperText sx={Dialogs.fieldHelperTextSx}>
                    {actionLabels.missing}
                  </FormHelperText>
                )}
              </FormControl>
              <TextField
                key="comment"
                id="comment"
                name="comment"
                margin="normal"
                fullWidth
                label="Comment"
                autoFocus
                multiline
                value={comment}
                error={commentError}
                helperText={commentError ? "Comment is required." : undefined}
                onChange={(event) => {
                  setComment(event.target.value);
                  setCommentError(false);
                }}
              />
              {requiresElectronicSignature && (
                <ApprovalRequestElectronicSignatureForm
                  errors={electronicSignatureErrors}
                  legalName={legalName}
                  organization={organization}
                  onFieldErrorClear={clearElectronicSignatureError}
                  onLegalNameChange={setLegalName}
                  onOrganizationChange={setOrganization}
                  onSignatureChange={handleSignatureChange}
                  signatureJson={signatureJson}
                  showOrganization={canEnterAssigneeOrganization}
                />
              )}
            </>
          )}
        </Stack>
      )}
      {tab === "request" && (
        <ApprovalRequestDetails
          approvalRequest={approvalRequest}
          approvalRequestTaskGlobalId={currentTask?.globalId}
          highlightedTaskGlobalId={currentTask?.globalId}
          showVisibleStepVisibility={false}
        />
      )}
      {tab === "chat" && discussionsAreEnabled && approvalRequest && currentTask && (
        <DiscussionPanel
          canSend={canSendDiscussion}
          ref={discussionPanel}
          requestGlobalId={approvalRequest.globalId}
          requesterDisplayName={approvalRequest.createdByDisplayName}
          requesterEmail={approvalRequest.createdByEmail}
          stepLabels={Object.fromEntries(
            approvalRequest.steps
              .filter((step) => step.globalId)
              .map((step) => [step.globalId!, `Step ${step.sequence}`]),
          )}
          steps={approvalRequest.steps}
          taskApprovalRequestStepGlobalId={
            currentTask.approvalRequestStepGlobalId
          }
          taskGlobalId={currentTask.globalId}
          tenantGlobalId={tenantGlobalId}
        />
      )}
      {tab === "link" && canManageSharedVerificationLinks && (
        <SharedVerificationLinksPanel
          approvalRequestTaskGlobalId={currentTask?.globalId}
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
          {tab === "task" && !isCompleted ? "Cancel" : "Close"}
        </Button>
        {tab === "chat" && discussionsAreEnabled && canSendDiscussion && (
          <Button
            variant="outlined"
            onClick={() => void discussionPanel.current?.send()}
          >
            Send
          </Button>
        )}
        {tab === "task" && !isCompleted && (
          <LoadingButton
            loading={taskIsSubmitting}
            variant="outlined"
            onClick={handleSubmit}
          >
            Submit
          </LoadingButton>
        )}
        {tab === "link" && canManageSharedVerificationLinks && (
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
        )}
      </Stack>
      {nameWarning && (
        <ConfirmationDialog
          cancelFirst
          cancelLabel="Go back"
          confirmLabel="Proceed anyway"
          message={nameWarning.message}
          open={nameWarningDialogIsOpen}
          title={nameWarning.title}
          onClose={() => setNameWarningDialogIsOpen(false)}
          onConfirm={async () => {
            await submit();
            return true;
          }}
        />
      )}
    </CloseOnEscape>
  );
};

export default observer(ApprovalRequestTask);
