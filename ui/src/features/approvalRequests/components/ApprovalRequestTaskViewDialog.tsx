import { stores } from "@/app/rootStore";
import { completeApprovalRequestTask } from "@/features/approvalRequests/api/approvalRequestTaskApi";
import ApprovalRequestFilesBox from "@/features/approvalRequests/components/ApprovalRequestFilesBox";
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
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import ApprovalRequestLogDialog from "./ApprovalRequestLogDialog";

interface ApprovalRequestTaskEditorProps {
  onClose: (currentTaskId?: number) => void;
}

const taskDescriptionSx = { whiteSpace: "pre-wrap" } as const;

const ApprovalRequestTaskEditor: React.FC<ApprovalRequestTaskEditorProps> = ({ onClose }) => {
  const [decisionError, setDecisionError] = useState(false);
  const [decision, setDecision] = useState("");
  const [comment, setComment] = useState("");
  const [logIsOpen, setLogIsOpen] = useState(false);
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
      <Stack spacing={Dialogs.formStackSpacing}>
        <Typography>{currentTask?.title ?? ""}</Typography>
        <ApprovalRequestFilesBox userFiles={currentTask?.approvalRequest.userFiles} />
        <Typography sx={taskDescriptionSx}>
          {currentTask?.description ?? ""}
        </Typography>
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
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
        <Button variant="outlined" onClick={handleClose}>Cancel</Button>
        {canViewRequest && (
          <Button variant="outlined" onClick={() => setLogIsOpen(true)}>
            Log
          </Button>
        )}
        {!isCompleted && <Button variant="outlined" onClick={handleSubmit}>Save</Button>}
      </Stack>
      <ApprovalRequestLogDialog
        approvalRequest={currentTask?.approvalRequest}
        open={logIsOpen}
        onClose={() => setLogIsOpen(false)}
      />
    </>
  );
};

export default observer(ApprovalRequestTaskEditor);
