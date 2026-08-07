import { stores } from "@/app/rootStore";
import { completeApprovalRequestTask } from "@/features/approvalRequests/api/approvalRequestTasksApi";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import ApprovalRequestElectronicSignatureForm from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureForm";
import type { ElectronicSignatureErrors } from "@/features/approvalRequests/components/ApprovalRequestElectronicSignatureForm";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { TenantType } from "@/features/tenants/models/tenant";
import { createApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/utils/approvalRequestTaskClientAuditContext";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import { createSharedVerificationLinkForTask } from "@/features/sharedVerificationLinks/api/sharedVerificationLinksApi";
import SharedVerificationLinksPanel from "@/features/sharedVerificationLinks/components/SharedVerificationLinksPanel";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessToast,
} from "@/shared/utils/toasts";
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
import { useCallback, useEffect, useState } from "react";

interface ApprovalRequestTaskProps {
  onClose: (currentTaskGlobalId?: string) => void;
}

const emptyElectronicSignatureErrors: ElectronicSignatureErrors = {
  legalName: "",
  signature: "",
};

const getDefaultLegalName = (isAssigneeEmployee: boolean | undefined): string => {
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

const ApprovalRequestTask: React.FC<ApprovalRequestTaskProps> = ({ onClose }) => {
  const [decisionError, setDecisionError] = useState(false);
  const [commentError, setCommentError] = useState(false);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [legalName, setLegalName] = useState("");
  const [organization, setOrganization] = useState("");
  const [signatureJson, setSignatureJson] = useState("");
  const [electronicSignatureErrors, setElectronicSignatureErrors] = useState<ElectronicSignatureErrors>(
    emptyElectronicSignatureErrors,
  );
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [selectedTab, setSelectedTab] = useState("task");
  const [hasSharedVerificationLink, setHasSharedVerificationLink] = useState(false);
  const [sharedVerificationLinksRefreshKey, setSharedVerificationLinksRefreshKey] = useState(0);
  const [nameWarningDialogIsOpen, setNameWarningDialogIsOpen] = useState(false);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const nameWarning = getIncompleteParticipantNameWarning(stores.tenantStore.currentTenant?.type);
  const inboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/inbox") : "/";
  const currentTask = stores.approvalRequestTaskStore.currentTask;
  const currentTaskAssigneeType = approvalRequest?.steps
    .find((step) => step.globalId === currentTask?.approvalRequestStepGlobalId)
    ?.assignees.find((assignee) => assignee.globalId === currentTask?.approvalRequestStepAssigneeGlobalId)
    ?.type;
  const isCompleted = Boolean(currentTask && currentTask.status !== ApprovalRequestTaskStatus.Pending);
  const actionLabels = getApprovalRequestTaskActionLabels(currentTask?.action);
  const completeTaskLoader = ActionLoaders.approvalRequestTasks.complete(currentTask?.globalId);
  const createSharedVerificationLinkLoader = ActionLoaders.sharedVerificationLinks.createForTask(
    currentTask?.globalId,
  );
  const createSharedVerificationLinkAction = useAsyncAction(createSharedVerificationLinkLoader);
  const submitAction = useAsyncAction(completeTaskLoader);
  const requiresElectronicSignature = currentTask?.action === ApprovalRequestTaskAction.Sign;
  const canEnterAssigneeOrganization = !currentTask?.isAssigneeEmployee;
  const canManageSharedVerificationLinks = Boolean(
    currentTask &&
    stores.productStore.sharedVerificationLinksAreEnabled &&
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
      currentTask?.assigneeLegalName?.trim() || getDefaultLegalName(currentTask?.isAssigneeEmployee),
    );
    setOrganization(currentTask?.assigneeOrganization ?? "");
    setSignatureJson(
      currentTask?.assigneeSignatureJson?.trim() || stores.userProfileStore.profile?.defaultSignatureJson || "",
    );
    setElectronicSignatureErrors(emptyElectronicSignatureErrors);
    setApprovalRequest(currentTask?.approvalRequest ?? null);
    setSelectedTab("task");
  }, [currentTask]);

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
              assigneeOrganization: canEnterAssigneeOrganization ? organization : undefined,
              assigneeSignatureJson: signatureJson,
            }
          : undefined,
        createApprovalRequestTaskClientAuditContext(),
      );
      if (didComplete) {
        showPersistenceSuccessToast(
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
    const firstName = currentTenant?.type === TenantType.Business
      ? currentTenant.currentEmployeeFirstName
      : stores.userProfileStore.profile?.firstName;
    const lastName = currentTenant?.type === TenantType.Business
      ? currentTenant.currentEmployeeLastName
      : stores.userProfileStore.profile?.lastName;
    if (!firstName?.trim() || !lastName?.trim()) {
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
      const linkGlobalId = await createSharedVerificationLinkForTask(tenantGlobalId, currentTask.globalId);
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
            label: "Inbox",
            state: currentTask ? { currentTaskGlobalId: currentTask.globalId } : undefined,
            to: inboxPath,
          },
          { label: "Task" },
        ]}
      />
      <Tabs
        value={selectedTab}
        onChange={(_, value: string) => setSelectedTab(value)}
        aria-label="Task sections"
      >
        <Tab label="Task" value="task" />
        <Tab label="Request" value="request" />
        {canManageSharedVerificationLinks && <Tab label="Link" value="link" />}
      </Tabs>
      {selectedTab === "task" && (
        <Stack
          spacing={Dialogs.formStackSpacing}
          sx={Dialogs.tabContentSx}
        >
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
      {selectedTab === "request" && (
        <ApprovalRequestDetails
          approvalRequest={approvalRequest}
          approvalRequestTaskGlobalId={currentTask?.globalId}
          highlightedTaskGlobalId={currentTask?.globalId}
          showVisibleStepVisibility={false}
        />
      )}
      {selectedTab === "link" && canManageSharedVerificationLinks && (
        <SharedVerificationLinksPanel
          approvalRequestTaskGlobalId={currentTask?.globalId}
          onHasLinkChange={setHasSharedVerificationLink}
          refreshKey={sharedVerificationLinksRefreshKey}
          tenantGlobalId={tenantGlobalId}
        />
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
        <Button variant="outlined" onClick={handleClose}>
          {selectedTab === "task" && !isCompleted ? "Cancel" : "Close"}
        </Button>
        {selectedTab === "task" && !isCompleted && (
          <LoadingButton loading={taskIsSubmitting} variant="outlined" onClick={handleSubmit}>
            Submit
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
    </>
  );
};

export default observer(ApprovalRequestTask);
