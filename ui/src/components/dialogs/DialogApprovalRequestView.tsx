import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { IApprovalRequest } from "../../models/ApprovalRequest";
import { ApprovalStatus } from "../../models/ApprovalStatus";
import { approvalRequestStore } from "../../stores/ApprovalRequestStore";
import { commonStore } from "../../stores/CommonStore";
import { getLocaleDateTimeString } from "../../utils/Converters";

const DialogApprovalRequestView = () => {
  const {
    approvalRequestViewDialogIsOpen,
    setApprovalRequestViewDialogIsOpen,
  } = commonStore;
  const { currentApprovalRequest, setCurrentApprovalRequest } =
    approvalRequestStore;

  const handleClose = () => {
    setApprovalRequestViewDialogIsOpen(false);
    setCurrentApprovalRequest(null);
  };

  const renderComment = (comment: string | undefined) => {
    return comment ? (
      <>
        <Typography>with comment:</Typography>
        <Paper sx={{ p: 1, mt: 1 }} elevation={3}>
          {(comment.split(/\r?\n/) as string[]).map((line) => (
            <Box>{line}</Box>
          ))}
        </Paper>
      </>
    ) : (
      <></>
    );
  };

  const renderSteps = (approvalRequest: IApprovalRequest) => {
    let steps: JSX.Element[] = [];
    const completedTasks = approvalRequest.tasks.filter((t) => t.completed);
    completedTasks.sort(
      (a, b) => b.completedDate!.getDate() - a.completedDate!.getDate()
    );
    steps = steps.concat(
      completedTasks.map((task) => (
        <Step active={true}>
          <StepLabel>
            {ApprovalStatus[task.status]} by {task.approver.toLowerCase()}
          </StepLabel>
          {task.completedDate && (
            <StepContent>
              <Typography>{`on ${getLocaleDateTimeString(
                task.completedDate
              )}`}</Typography>
              {renderComment(task.comment)}
            </StepContent>
          )}
        </Step>
      ))
    );
    const uncompletedTasks = approvalRequest.tasks.filter((t) => !t.completed);
    steps = steps.concat(
      uncompletedTasks.map((task) => (
        <Step active={false}>
          <StepLabel>
            Requested approval from {task.approver.toLowerCase()}
          </StepLabel>
        </Step>
      ))
    );

    return (
      <Box sx={{ pb: 2 }}>
        <Stepper orientation="vertical">{steps}</Stepper>
      </Box>
    );
  };

  return (
    <Dialog open={approvalRequestViewDialogIsOpen} onClose={handleClose}>
      <DialogTitle>Approval tracking</DialogTitle>
      <DialogContent dividers>
        {currentApprovalRequest && renderSteps(currentApprovalRequest)}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(DialogApprovalRequestView);
