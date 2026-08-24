import { stores } from "@/app/rootStore";
import { completeApprovalRequestTask } from "@/features/approvalRequests/api/approvalRequestTasksApi";
import ApprovalRequestActionBar from "@/features/approvalRequests/components/ApprovalRequestActionBar";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import ApprovalRequestDiscussionSection from "@/features/approvalRequests/components/ApprovalRequestDiscussionSection";
import type { ElectronicSignatureErrors } from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureForm";
import ApprovalRequestElectronicSignatureForm from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureForm";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import ApprovalRequestTaskAttachments, {
  ApprovalRequestTaskAttachmentsHandle,
} from "@/features/approvalRequests/components/ApprovalRequestTaskAttachments";
import ApprovalRequestTaskAttachmentList from "@/features/approvalRequests/components/ApprovalRequestTaskAttachmentList";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import { createApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/utils/approvalRequestTaskClientAuditContext";
import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import {
  getParticipantName,
  hasIncompleteBusinessParticipantName,
} from "@/features/approvalRequests/utils/participantName";
import { UserFile } from "@/features/userFiles/models/userFile";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import {
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
  tab: "task" | "request" | "chat";
  taskGlobalId: string;
}

const emptyElectronicSignatureErrors: ElectronicSignatureErrors = {
  legalName: "",
  signature: "",
};

const getDefaultLegalName = (isAssigneeEmployee: boolean | undefined): string => {
  const { firstName, lastName } = getParticipantName(
    stores.tenantStore.currentTenant,
    stores.userProfileStore.profile,
    isAssigneeEmployee,
  );
  return [firstName, lastName]
    .map((name) => name?.trim())
    .filter((name): name is string => Boolean(name))
    .join(" ");
};

const ApprovalRequestTask: React.FC<ApprovalRequestTaskProps> = ({ onClose, tab, taskGlobalId }) => {
  const navigate = useNavigate();
  const [decisionError, setDecisionError] = useState(false);
  const [commentError, setCommentError] = useState(false);
  const [result, setResult] = useState<boolean | undefined>(undefined);
  const [comment, setComment] = useState("");
  const [legalName, setLegalName] = useState("");
  const [representationDetails, setRepresentationDetails] = useState("");
  const [signatureJson, setSignatureJson] = useState("");
  const [electronicSignatureErrors, setElectronicSignatureErrors] =
    useState<ElectronicSignatureErrors>(emptyElectronicSignatureErrors);
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [nameWarningDialogIsOpen, setNameWarningDialogIsOpen] = useState(false);
  const [taskAttachmentFiles, setTaskAttachmentFiles] = useState<UserFile[]>([]);
  const taskAttachments = useRef<ApprovalRequestTaskAttachmentsHandle>(null);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const nameWarning = getIncompleteParticipantNameWarning(stores.tenantStore.currentTenant?.type);
  const tasksPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/tasks") : "/";
  const currentTask = stores.approvalRequestTaskStore.currentTask;
  const requestTabLabel = approvalRequest ? `Request ${getApprovalRequestNumber(approvalRequest.globalId)}` : "Request";
  const currentTaskAssigneeType = approvalRequest?.steps
    .find((step) => step.globalId === currentTask?.approvalRequestStepGlobalId)
    ?.assignees.find((assignee) => assignee.globalId === currentTask?.approvalRequestStepAssigneeGlobalId)?.type;
  const discussionStep = approvalRequest?.steps.find(
    (step) => step.globalId === currentTask?.approvalRequestStepGlobalId,
  );
  const canSendDiscussion =
    approvalRequest?.status !== ApprovalRequestStatus.Completed &&
    discussionStep?.tasks?.some((task) => task.status === ApprovalRequestTaskStatus.Pending) === true;
  const discussionsAreEnabled = stores.applicationConfigurationStore.discussionsAreEnabled;
  const discussionAttachmentsAreEnabled = stores.applicationConfigurationStore.discussionAttachmentsAreEnabled;
  const taskAttachmentsAreEnabled = stores.applicationConfigurationStore.taskAttachmentsAreEnabled;
  const isCompleted = Boolean(currentTask && currentTask.status !== ApprovalRequestTaskStatus.Pending);
  const actionLabels = getApprovalRequestTaskActionLabels(currentTask?.action);
  const completeTaskLoader = ActionLoaders.approvalRequestTasks.complete(currentTask?.globalId);
  const submitAction = useAsyncAction(completeTaskLoader);
  const requiresElectronicSignature = result === true && currentTask?.isElectronicSignatureRequired === true;
  const canEnterRepresentationDetails = !currentTask?.isAssigneeEmployee;
  const taskIsSubmitting = submitAction.isRunning || stores.commonStore.isActionLoading(completeTaskLoader);

  useEffect(() => {
    setResult(currentTask?.result);
    setComment(currentTask?.comment ?? "");
    setLegalName(currentTask?.assigneeLegalName?.trim() || getDefaultLegalName(currentTask?.isAssigneeEmployee));
    setRepresentationDetails(currentTask?.assigneeRepresentationDetails ?? "");
    setSignatureJson(
      currentTask?.assigneeSignatureJson?.trim() || stores.userProfileStore.profile?.defaultSignatureJson || "",
    );
    setElectronicSignatureErrors(emptyElectronicSignatureErrors);
    setApprovalRequest(currentTask?.approvalRequest ?? null);
  }, [currentTask]);

  useEffect(() => {
    setTaskAttachmentFiles([]);
  }, [taskGlobalId]);

  const navigateToTab = (value: ApprovalRequestTaskProps["tab"]) => {
    if (!tenantGlobalId) return;
    navigate(Routes.tenantPath(tenantGlobalId, `/tasks/${taskGlobalId}${value === "task" ? "" : `/${value}`}`));
  };

  const cleanUp = () => {
    setDecisionError(false);
    setCommentError(false);
    setResult(undefined);
    setComment("");
    setLegalName("");
    setRepresentationDetails("");
    setSignatureJson("");
    setElectronicSignatureErrors(emptyElectronicSignatureErrors);
    setTaskAttachmentFiles([]);
  };

  const handleClose = () => {
    cleanUp();
    onClose(currentTask?.globalId);
  };

  const handleSignatureChange = useCallback((value: string) => {
    setSignatureJson(value);
    setElectronicSignatureErrors((current) => ({ ...current, signature: "" }));
  }, []);

  const clearElectronicSignatureError = (field: keyof ElectronicSignatureErrors) => {
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
    if (result === undefined) {
      setDecisionError(true);
      return;
    }
    if (!currentTask || !stores.userAccountStore.currentUser) return;
    const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
    if (!tenantGlobalId) return;
    if ((result === false || currentTask.isCommentRequired) && !comment.trim()) {
      setCommentError(true);
      return;
    }
    if (
      result === true &&
      currentTask.isAttachmentRequired &&
      taskAttachmentFiles.length === 0 &&
      (currentTask.taskFiles?.length ?? 0) === 0
    ) {
      notification.warning("At least one attachment is required.");
      return;
    }
    if (requiresElectronicSignature) {
      if (!validateElectronicSignature()) {
        return;
      }
    }

    await submitAction.run(async () => {
      if (taskAttachments.current && !(await taskAttachments.current.attach())) {
        return;
      }

      const didComplete = await completeApprovalRequestTask(
        tenantGlobalId,
        currentTask.globalId,
        result,
        comment,
        requiresElectronicSignature
          ? {
              assigneeLegalName: legalName.trim(),
              assigneeRepresentationDetails: canEnterRepresentationDetails ? representationDetails : undefined,
              assigneeSignatureJson: signatureJson,
            }
          : undefined,
        createApprovalRequestTaskClientAuditContext(),
      );
      if (didComplete) {
        showPersistenceSuccessNotification(PersistenceSuccessMessages.approvalDecisionSubmitted);
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

    if (hasIncompleteBusinessParticipantName(stores.tenantStore.currentTenant, stores.userProfileStore.profile)) {
      setNameWarningDialogIsOpen(true);
      return;
    }

    void submit();
  };

  if (tab === "chat" && !discussionsAreEnabled) {
    return <NotFoundPage />;
  }

  return (
    <CloseOnEscape onClose={handleClose}>
      <PageBreadcrumbs
        items={[
          {
            label: "Tasks",
            state: currentTask ? { currentTaskGlobalId: currentTask.globalId } : undefined,
            to: tasksPath,
          },
          { label: `Task ${getApprovalRequestNumber(currentTask?.globalId)}` },
        ]}
      />
      <Tabs
        scrollButtons={false}
        value={tab}
        variant="scrollable"
        onChange={(_, value: ApprovalRequestTaskProps["tab"]) => navigateToTab(value)}
        aria-label="Task sections"
      >
        <Tab label="Task" value="task" />
        <Tab label={requestTabLabel} value="request" />
        {discussionsAreEnabled && <Tab label="Chat" value="chat" />}
      </Tabs>
      {tab === "task" && (
        <Stack sx={Dialogs.tabContentSx}>
          <Stack spacing={Dialogs.formStackSpacing}>
            {currentTask && (
              <ApprovalRequestTaskSummaryBlock
                additionalMetadata={
                  isCompleted && taskAttachmentsAreEnabled && currentTask.taskFiles?.length && tenantGlobalId ? (
                    <ApprovalRequestTaskAttachmentList
                      label="Files attached to this decision"
                      taskFiles={currentTask.taskFiles ?? []}
                      taskGlobalId={currentTask.globalId}
                      tenantGlobalId={tenantGlobalId}
                    />
                  ) : undefined
                }
                participant="assignee"
                participantType={currentTaskAssigneeType}
                showComment
                showElectronicSignature={requiresElectronicSignature || currentTask.hasAssigneeSignature}
                task={currentTask}
              />
            )}
            {!isCompleted && taskAttachmentsAreEnabled && currentTask && tenantGlobalId && (
              <ApprovalRequestTaskAttachments
                canManageFiles={!isCompleted}
                newFiles={taskAttachmentFiles}
                onNewFilesChange={setTaskAttachmentFiles}
                ref={taskAttachments}
                taskFiles={currentTask.taskFiles ?? []}
                taskGlobalId={currentTask.globalId}
                tenantGlobalId={tenantGlobalId}
              />
            )}
            {!isCompleted && (
              <>
                <FormControl key="decision" error={decisionError}>
                  <RadioGroup
                    row
                    name="decision"
                    value={result === undefined ? "" : String(result)}
                    onChange={(event) => {
                      setResult(event.target.value === "true");
                      setDecisionError(false);
                    }}
                  >
                    <FormControlLabel value="true" control={<Radio />} label={actionLabels.positive} />
                    <FormControlLabel value="false" control={<Radio />} label={actionLabels.negative} />
                  </RadioGroup>
                  {decisionError && (
                    <FormHelperText sx={Dialogs.fieldHelperTextSx}>{actionLabels.missing}</FormHelperText>
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
                    representationDetails={representationDetails}
                    onFieldErrorClear={clearElectronicSignatureError}
                    onLegalNameChange={setLegalName}
                    onRepresentationDetailsChange={setRepresentationDetails}
                    onSignatureChange={handleSignatureChange}
                    signatureJson={signatureJson}
                    showRepresentationDetails={canEnterRepresentationDetails}
                  />
                )}
              </>
            )}
          </Stack>
          <ApprovalRequestActionBar onClose={handleClose}>
            {!isCompleted && (
              <MainActionButton loading={taskIsSubmitting} onClick={handleSubmit}>
                Submit
              </MainActionButton>
            )}
          </ApprovalRequestActionBar>
        </Stack>
      )}
      {tab === "request" && (
        <>
          <ApprovalRequestDetails
            approvalRequest={approvalRequest}
            approvalRequestTaskGlobalId={currentTask?.globalId}
            highlightedTaskGlobalId={currentTask?.globalId}
            showVisibleStepVisibility={false}
            taskAttachmentsTenantGlobalId={taskAttachmentsAreEnabled ? (tenantGlobalId ?? undefined) : undefined}
          />
          <ApprovalRequestActionBar onClose={handleClose} />
        </>
      )}
      {tab === "chat" && discussionsAreEnabled && approvalRequest && currentTask && (
        <ApprovalRequestDiscussionSection
          attachmentsAreEnabled={discussionAttachmentsAreEnabled}
          approvalRequest={approvalRequest}
          canSend={canSendDiscussion}
          onClose={handleClose}
          task={currentTask}
          tenantGlobalId={tenantGlobalId}
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
