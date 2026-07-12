import { stores } from "@/app/rootStore";
import { completeApprovalRequestTask } from "@/features/approvalRequests/api/approvalRequestTaskApi";
import ApprovalRequestFilesBox from "@/features/approvalRequests/components/ApprovalRequestFilesBox";
import ApprovalRequestLog from "@/features/approvalRequests/components/ApprovalRequestLog";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
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
  const [selectedTab, setSelectedTab] = useState("task");
  const currentTask = stores.approvalRequestTaskStore.currentTask;
  const canViewRequest = currentTask?.canViewRequest !== false;
  const isCompleted = Boolean(currentTask?.completedAt);

  useEffect(() => {
    setDecision(
      currentTask?.status === ApprovalRequestTaskStatus.Approved
        ? "approve"
        : currentTask?.status === ApprovalRequestTaskStatus.Rejected
          ? "reject"
          : "",
    );
    setComment(currentTask?.comment ?? "");
    setSelectedTab("task");
  }, [currentTask]);

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

    const didComplete = await completeApprovalRequestTask(
      currentTask.id,
      decision === "approve"
        ? ApprovalRequestTaskStatus.Approved
        : ApprovalRequestTaskStatus.Rejected,
      comment,
    );
    if (didComplete) {
      cleanUp();
      stores.approvalRequestTaskStore.clear();
      stores.approvalRequestTaskStore.loadIncoming();
      stores.approvalRequestTaskStore.loadUncompletedCount();
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
          <Tab label="Log" value="log" />
        </Tabs>
      )}
      {selectedTab === "task" && (
        <Stack
          spacing={Dialogs.formStackSpacing}
          sx={canViewRequest ? Dialogs.tabContentSx : undefined}
        >
          <TextField
            fullWidth
            label="Title"
            value={currentTask?.title ?? ""}
            disabled
          />
          <ApprovalRequestFilesBox userFiles={currentTask?.approvalRequest.userFiles} />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={Dialogs.commentTextFieldRows}
            value={currentTask?.description ?? ""}
            disabled
          />
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
                disabled={isCompleted}
              />
              <FormControlLabel
                value="reject"
                control={<Radio />}
                label="Reject"
                disabled={isCompleted}
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
            rows={Dialogs.commentTextFieldRows}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={isCompleted}
          />
        </Stack>
      )}
      {selectedTab === "log" && canViewRequest && (
        <ApprovalRequestLog approvalRequest={currentTask?.approvalRequest} />
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
        {!isCompleted && <Button variant="outlined" onClick={handleSubmit}>Save</Button>}
      </Stack>
    </>
  );
};

export default observer(ApprovalRequestTaskEditor);
