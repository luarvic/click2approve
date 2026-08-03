import { stores } from "@/app/rootStore";
import { completeApprovalRequestTask } from "@/features/approvalRequests/api/approvalRequestTasksApi";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import ApprovalRequestIdentityVerificationForm from "@/features/approvalRequests/components/ApprovalRequestIdentityVerificationForm";
import type { IdentityVerificationErrors } from "@/features/approvalRequests/components/ApprovalRequestIdentityVerificationForm";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { createApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/utils/approvalRequestTaskClientAuditContext";
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
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";

interface ApprovalRequestTaskProps {
  onClose: (currentTaskGlobalId?: string) => void;
}

const emptyIdentityVerificationErrors: IdentityVerificationErrors = {
  dateOfBirth: "",
  legalName: "",
  signature: "",
};

const ApprovalRequestTask: React.FC<ApprovalRequestTaskProps> = ({ onClose }) => {
  const [decisionError, setDecisionError] = useState(false);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [legalName, setLegalName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [signatureJson, setSignatureJson] = useState("");
  const [identityVerificationErrors, setIdentityVerificationErrors] = useState<IdentityVerificationErrors>(
    emptyIdentityVerificationErrors,
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
  const requiresIdentityVerification = currentTask?.requiresIdentityVerification === true;
  const canManageSharedVerificationLinks = Boolean(
    currentTask &&
    stores.productStore.sharedVerificationLinksAreEnabled &&
    approvalRequest?.status === ApprovalRequestStatus.Approved,
  );

  useEffect(() => {
    setDecision(
      currentTask?.status === ApprovalRequestTaskStatus.Approved
        ? "approve"
        : currentTask?.status === ApprovalRequestTaskStatus.Rejected
          ? "reject"
          : "",
    );
    setComment(currentTask?.comment ?? "");
    setLegalName(currentTask?.approverLegalName ?? "");
    setDateOfBirth(currentTask?.approverDateOfBirth ?? "");
    setSignatureJson("");
    setIdentityVerificationErrors(emptyIdentityVerificationErrors);
    setApprovalRequest(currentTask?.approvalRequest ?? null);
    setSelectedTab("task");
  }, [currentTask]);

  const cleanUp = () => {
    setDecisionError(false);
    setDecision("");
    setComment("");
    setLegalName("");
    setDateOfBirth("");
    setSignatureJson("");
    setIdentityVerificationErrors(emptyIdentityVerificationErrors);
  };

  const handleClose = () => {
    cleanUp();
    onClose(currentTask?.globalId);
  };

  const handleSignatureChange = useCallback((value: string) => {
    setSignatureJson(value);
    setIdentityVerificationErrors((current) => ({ ...current, signature: "" }));
  }, []);

  const clearIdentityVerificationError = (field: keyof IdentityVerificationErrors) => {
    setIdentityVerificationErrors((current) => ({ ...current, [field]: "" }));
  };

  const validateIdentityVerification = (): boolean => {
    const today = dayjs().startOf("day");
    const dateValue = dateOfBirth ? dayjs(dateOfBirth) : null;
    const nextErrors: IdentityVerificationErrors = {
      dateOfBirth: !dateValue
        ? "Date of birth is required."
        : !dateValue.isValid()
          ? "Enter a valid date of birth."
          : !dateValue.isBefore(today)
            ? "Date of birth must be in the past."
            : "",
      legalName: legalName.trim() ? "" : "Legal name is required.",
      signature: signatureJson ? "" : "Signature is required.",
    };

    setIdentityVerificationErrors(nextErrors);
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
    if (requiresIdentityVerification) {
      if (!validateIdentityVerification()) {
        return;
      }
    }

    const didComplete = await completeApprovalRequestTask(
      tenantGlobalId,
      currentTask.globalId,
      decision === "approve"
        ? ApprovalRequestTaskStatus.Approved
        : ApprovalRequestTaskStatus.Rejected,
      comment,
      requiresIdentityVerification
        ? {
            approverDateOfBirth: dateOfBirth,
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
              showIdentityVerification={requiresIdentityVerification}
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
                    label="Approve"
                  />
                  <FormControlLabel
                    value="reject"
                    control={<Radio />}
                    label="Reject"
                  />
                </RadioGroup>
                {decisionError && (
                  <FormHelperText sx={Dialogs.fieldHelperTextSx}>
                    You should either approve or reject
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
                onChange={(event) => setComment(event.target.value)}
              />
              {requiresIdentityVerification && (
                <ApprovalRequestIdentityVerificationForm
                  dateOfBirth={dateOfBirth}
                  errors={identityVerificationErrors}
                  legalName={legalName}
                  onDateOfBirthChange={setDateOfBirth}
                  onFieldErrorClear={clearIdentityVerificationError}
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
          highlightedTaskGlobalId={currentTask?.globalId}
          onHighlightedTaskClick={() => setSelectedTab("task")}
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
