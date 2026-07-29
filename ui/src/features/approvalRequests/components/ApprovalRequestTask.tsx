import { stores } from "@/app/rootStore";
import { completeApprovalRequestTask } from "@/features/approvalRequests/api/approvalRequestTasksApi";
import ApprovalRequestComment from "@/features/approvalRequests/components/ApprovalRequestComment";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import ApprovalRequestLog from "@/features/approvalRequests/components/ApprovalRequestLog";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
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
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

interface ApprovalRequestTaskProps {
  onClose: (currentTaskGlobalId?: string) => void;
}

const ApprovalRequestTask: React.FC<ApprovalRequestTaskProps> = ({ onClose }) => {
  const [decisionError, setDecisionError] = useState(false);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [selectedTab, setSelectedTab] = useState("task");
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const inboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/inbox") : "/";
  const currentTask = stores.approvalRequestTaskStore.currentTask;
  const isCompleted = Boolean(currentTask && currentTask.status !== ApprovalRequestTaskStatus.Pending);

  useEffect(() => {
    setDecision(
      currentTask?.status === ApprovalRequestTaskStatus.Approved
        ? "approve"
        : currentTask?.status === ApprovalRequestTaskStatus.Rejected
          ? "reject"
          : "",
    );
    setComment(currentTask?.comment ?? "");
    setApprovalRequest(currentTask?.approvalRequest ?? null);
    setSelectedTab("task");
  }, [currentTask]);

  const cleanUp = () => {
    setDecisionError(false);
    setDecision("");
    setComment("");
  };

  const handleClose = () => {
    cleanUp();
    onClose(currentTask?.globalId);
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

    const didComplete = await completeApprovalRequestTask(
      tenantGlobalId,
      currentTask.globalId,
      decision === "approve"
        ? ApprovalRequestTaskStatus.Approved
        : ApprovalRequestTaskStatus.Rejected,
      comment,
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
            ? <ApprovalRequestComment label="Comment" text={currentTask?.comment} />
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
