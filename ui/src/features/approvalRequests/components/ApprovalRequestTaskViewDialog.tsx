import { stores } from "@/app/rootStore";
import { getApprovalRequest } from "@/features/approvalRequests/api/approvalRequestsApi";
import { completeApprovalRequestTask } from "@/features/approvalRequests/api/approvalRequestTasksApi";
import ApprovalRequestComment from "@/features/approvalRequests/components/ApprovalRequestComment";
import ApprovalRequestDetails from "@/features/approvalRequests/components/ApprovalRequestDetails";
import ApprovalRequestLog from "@/features/approvalRequests/components/ApprovalRequestLog";
import ApprovalRequestTaskSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestTaskSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { normalizeApprovalRequestDates } from "@/features/approvalRequests/utils/approvalRequestDateNormalizers";
import { Dialogs, Pages } from "@/shared/constants/constants";
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
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";

interface ApprovalRequestTaskEditorProps {
  onClose: (currentTaskId?: number) => void;
}

const ApprovalRequestTaskEditor: React.FC<ApprovalRequestTaskEditorProps> = ({ onClose }) => {
  const [decisionError, setDecisionError] = useState(false);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [approvalRequest, setApprovalRequest] = useState<ApprovalRequest | null>(null);
  const [selectedTab, setSelectedTab] = useState("task");
  const currentTask = stores.approvalRequestTaskStore.currentTask;
  const canViewRequest = currentTask?.canViewRequest === true;
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

  useEffect(() => {
    let active = true;
    if (
      !canViewRequest ||
      (selectedTab !== "request" && selectedTab !== "log") ||
      !currentTask?.approvalRequestId ||
      approvalRequest
    ) {
      return;
    }

    const load = async () => {
      const tenantId = stores.tenantStore.currentTenantId;
      if (!tenantId) {
        return;
      }

      const approvalRequest = await getApprovalRequest(tenantId, currentTask.approvalRequestId);
      if (active && approvalRequest) {
        normalizeApprovalRequestDates(approvalRequest);
        setApprovalRequest(approvalRequest);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [approvalRequest, canViewRequest, currentTask?.approvalRequestId, selectedTab]);

  const cleanUp = () => {
    setDecisionError(false);
    setDecision("");
    setComment("");
  };

  const handleClose = () => {
    cleanUp();
    onClose(currentTask?.id);
  };

  const handleSubmit = async () => {
    if (isCompleted) return;
    if (!decision) {
      setDecisionError(true);
      return;
    }
    if (!currentTask || !stores.userAccountStore.currentUser) return;
    const tenantId = stores.tenantStore.currentTenantId;
    if (!tenantId) return;

    const didComplete = await completeApprovalRequestTask(
      tenantId,
      currentTask.id,
      decision === "approve"
        ? ApprovalRequestTaskStatus.Approved
        : ApprovalRequestTaskStatus.Rejected,
      comment,
    );
    if (didComplete) {
      cleanUp();
      stores.approvalRequestTaskStore.clear();
      stores.approvalRequestTaskStore.loadUncompletedCount(tenantId);
      onClose(currentTask.id);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Approval request task
      </Typography>
      {canViewRequest && (
        <Tabs
          value={selectedTab}
          onChange={(_, value: string) => setSelectedTab(value)}
          aria-label="Approval request task sections"
        >
          <Tab label="Task" value="task" />
          <Tab label="Request" value="request" />
          <Tab label="Log" value="log" />
        </Tabs>
      )}
      {selectedTab === "task" && (
        <Stack
          spacing={Dialogs.formStackSpacing}
          sx={canViewRequest ? Dialogs.tabContentSx : undefined}
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
      {selectedTab === "request" && canViewRequest && (
        <ApprovalRequestDetails approvalRequest={approvalRequest} />
      )}
      {selectedTab === "log" && canViewRequest && (
        <ApprovalRequestLog approvalRequest={approvalRequest} />
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
        {!isCompleted && <Button variant="outlined" onClick={handleSubmit}>Save</Button>}
      </Stack>
    </>
  );
};

export default observer(ApprovalRequestTaskEditor);
