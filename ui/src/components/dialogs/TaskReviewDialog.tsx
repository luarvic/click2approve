import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ApprovalStatus } from "../../models/approvalStatus";
import { Tab } from "../../models/tab";
import { commonStore } from "../../stores/commonStore";
import { taskStore } from "../../stores/taskStore";
import { userAccountStore } from "../../stores/userAccountStore";
import { completeTask } from "../../utils/apiClient";
import { UserFilesList } from "../lists/UserFilesList";

const TaskReviewDialog = () => {
  const { currentTab, taskReviewDialogIsOpen, setTaskReviewDialogIsOpen } =
    commonStore;
  const {
    currentTask,
    setCurrentTask,
    clearTasks,
    loadTasks,
    loadNumberOfUncompletedTasks,
  } = taskStore;
  const { currentUser } = userAccountStore;
  const [comment, setComment] = useState<string>("");

  const handleClose = () => {
    setCurrentTask(null);
    setComment("");
    setTaskReviewDialogIsOpen(false);
  };

  const rejectOrApprove = (status: ApprovalStatus) => {
    currentTask &&
      currentUser &&
      completeTask(currentTask.id, status, comment).then(() => {
        handleClose();
        clearTasks();
        loadTasks(Tab.Inbox);
        loadNumberOfUncompletedTasks();
      });
  };

  const handleReject = () => {
    rejectOrApprove(ApprovalStatus.Rejected);
  };

  const handleApprove = () => {
    rejectOrApprove(ApprovalStatus.Approved);
  };

  const renderDialogActions = (tab: Tab) => {
    const result: JSX.Element[] = [
      <Button key="Cancel" onClick={handleClose}>
        Cancel
      </Button>,
    ];
    if (tab === Tab.Inbox) {
      result.push(
        <Button key="Reject" onClick={handleReject}>
          Reject
        </Button>
      );
      result.push(
        <Button key="Approve" onClick={handleApprove}>
          Approve
        </Button>
      );
    }
    return <DialogActions>{result}</DialogActions>;
  };

  const renderDialogInputs = (tab: Tab) => {
    const result: JSX.Element[] = [];
    if (tab === Tab.Inbox) {
      result.push(
        <TextField
          key="comment"
          margin="normal"
          fullWidth
          label="Comment"
          autoFocus
          variant="standard"
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
          multiline
          rows={4}
        />
      );
    }
    return <>{result}</>;
  };

  return (
    <Dialog open={taskReviewDialogIsOpen} onClose={handleClose}>
      <DialogTitle>Review the files</DialogTitle>
      <DialogContent dividers>
        {currentTask && (
          <UserFilesList userFiles={currentTask.approvalRequest.userFiles} />
        )}
        {currentTab && renderDialogInputs(currentTab)}
      </DialogContent>
      {currentTab && renderDialogActions(currentTab)}
    </Dialog>
  );
};

export default observer(TaskReviewDialog);
