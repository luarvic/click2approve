import { stores } from "@/app/rootStore";
import { completeApprovalRequestTask } from "@/features/approvalRequests/api/approvalRequestTasksApi";
import ApprovalRequestComment from "@/features/approvalRequests/components/ApprovalRequestComment";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import ApprovalRequestIdentityVerificationForm from "@/features/approvalRequests/components/ApprovalRequestIdentityVerificationForm";
import type { IdentityVerificationErrors } from "@/features/approvalRequests/components/ApprovalRequestIdentityVerificationForm";
import ApprovalRequestIdentityVerificationView from "@/features/approvalRequests/components/ApprovalRequestIdentityVerificationView";
import ApprovalRequestLog from "@/features/approvalRequests/components/ApprovalRequestLog";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { createApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/utils/approvalRequestTaskClientAuditContext";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessToast,
} from "@/shared/utils/toasts";
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
  legalFirstName: "",
  legalLastName: "",
  signature: "",
};

const ApprovalRequestTask: React.FC<ApprovalRequestTaskProps> = ({ onClose }) => {
  const [decisionError, setDecisionError] = useState(false);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [legalFirstName, setLegalFirstName] = useState("");
  const [legalLastName, setLegalLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [signatureJson, setSignatureJson] = useState("");
  const [identityVerificationErrors, setIdentityVerificationErrors] = useState<IdentityVerificationErrors>(
    emptyIdentityVerificationErrors,
  );
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [selectedTab, setSelectedTab] = useState("task");
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const inboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/inbox") : "/";
  const currentTask = stores.approvalRequestTaskStore.currentTask;
  const isCompleted = Boolean(currentTask && currentTask.status !== ApprovalRequestTaskStatus.Pending);
  const requiresIdentityVerification = currentTask?.requiresIdentityVerification === true;

  useEffect(() => {
    setDecision(
      currentTask?.status === ApprovalRequestTaskStatus.Approved
        ? "approve"
        : currentTask?.status === ApprovalRequestTaskStatus.Rejected
          ? "reject"
          : "",
    );
    setComment(currentTask?.comment ?? "");
    setLegalFirstName(currentTask?.approverLegalFirstName ?? "");
    setLegalLastName(currentTask?.approverLegalLastName ?? "");
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
    setLegalFirstName("");
    setLegalLastName("");
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
      legalFirstName: legalFirstName.trim() ? "" : "Legal first name is required.",
      legalLastName: legalLastName.trim() ? "" : "Legal last name is required.",
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
            approverLegalFirstName: legalFirstName.trim(),
            approverLegalLastName: legalLastName.trim(),
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
        <Tab label="Log" value="log" />
      </Tabs>
      {selectedTab === "task" && (
        <Stack
          spacing={Dialogs.formStackSpacing}
          sx={Dialogs.tabContentSx}
        >
          {currentTask && <ApprovalRequestTaskSummaryBlock task={currentTask} />}
          {isCompleted
            ? (
              <>
                <ApprovalRequestComment label="Comment" text={currentTask?.comment} />
                {currentTask && requiresIdentityVerification && (
                  <ApprovalRequestIdentityVerificationView task={currentTask} />
                )}
              </>
            )
            : (
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
                    legalFirstName={legalFirstName}
                    legalLastName={legalLastName}
                    onDateOfBirthChange={setDateOfBirth}
                    onFieldErrorClear={clearIdentityVerificationError}
                    onLegalFirstNameChange={setLegalFirstName}
                    onLegalLastNameChange={setLegalLastName}
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
          showVisibleStepVisibility={false}
        />
      )}
      {selectedTab === "log" && (
        <ApprovalRequestLog approvalRequest={approvalRequest} />
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
        <Button variant="outlined" onClick={handleClose}>
          {isCompleted ? "Close" : "Cancel"}
        </Button>
        {!isCompleted && <Button variant="outlined" onClick={handleSubmit}>Submit</Button>}
      </Stack>
    </>
  );
};

export default observer(ApprovalRequestTask);
