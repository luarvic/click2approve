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
import { createApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/utils/approvalRequestTaskClientAuditContext";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import { createSharedVerificationLinkForTask } from "@/features/sharedVerificationLinks/api/sharedVerificationLinksApi";
import SharedVerificationLinksPanel from "@/features/sharedVerificationLinks/components/SharedVerificationLinksPanel";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessToast,
} from "@/shared/utils/toasts";
import { LinkOutlined } from "@mui/icons-material";
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

const ApprovalRequestTask: React.FC<ApprovalRequestTaskProps> = ({ onClose }) => {
  const [decisionError, setDecisionError] = useState(false);
  const [commentError, setCommentError] = useState(false);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [legalName, setLegalName] = useState("");
  const [signatureJson, setSignatureJson] = useState("");
  const [electronicSignatureErrors, setElectronicSignatureErrors] = useState<ElectronicSignatureErrors>(
    emptyElectronicSignatureErrors,
  );
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [selectedTab, setSelectedTab] = useState("task");
  const [hasSharedVerificationLink, setHasSharedVerificationLink] = useState(false);
  const [isCreatingSharedVerificationLink, setIsCreatingSharedVerificationLink] = useState(false);
  const [sharedVerificationLinksRefreshKey, setSharedVerificationLinksRefreshKey] = useState(0);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const inboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/inbox") : "/";
  const currentTask = stores.approvalRequestTaskStore.currentTask;
  const isCompleted = Boolean(currentTask && currentTask.status !== ApprovalRequestTaskStatus.Pending);
  const actionLabels = getApprovalRequestTaskActionLabels(currentTask?.action);
  const requiresElectronicSignature = currentTask?.action === ApprovalRequestTaskAction.Sign;
  const canManageSharedVerificationLinks = Boolean(
    currentTask &&
    stores.productStore.sharedVerificationLinksAreEnabled &&
    approvalRequest?.status === ApprovalRequestStatus.Completed &&
    approvalRequest.result === true,
  );

  useEffect(() => {
    setDecision(
      currentTask?.result === true
        ? "approve"
        : currentTask?.result === false
          ? "reject"
          : "",
    );
    setComment(currentTask?.comment ?? "");
    setLegalName(currentTask?.approverLegalName ?? "");
    setSignatureJson("");
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

  const handleSubmit = async () => {
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

    const didComplete = await completeApprovalRequestTask(
      tenantGlobalId,
      currentTask.globalId,
      decision === "approve",
      comment,
      requiresElectronicSignature
        ? {
            approverLegalName: legalName.trim(),
            approverSignatureJson: signatureJson,
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
  };

  const handleCreateSharedVerificationLink = async () => {
    if (!currentTask || !tenantGlobalId || hasSharedVerificationLink) {
      return;
    }

    setIsCreatingSharedVerificationLink(true);
    const linkGlobalId = await createSharedVerificationLinkForTask(tenantGlobalId, currentTask.globalId)
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
                  onFieldErrorClear={clearElectronicSignatureError}
                  onLegalNameChange={setLegalName}
                  onSignatureChange={handleSignatureChange}
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
        {selectedTab === "task" && !isCompleted && <Button variant="outlined" onClick={handleSubmit}>Submit</Button>}
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
    </>
  );
};

export default observer(ApprovalRequestTask);
