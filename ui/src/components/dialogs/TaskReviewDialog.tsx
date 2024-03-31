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
import { stores } from "../../stores/Stores";
import { completeTask } from "../../utils/apiClient";
import { UserFilesList } from "../lists/UserFilesList";

const TaskReviewDialog = () => {
  const [comment, setComment] = useState<string>("");

  const handleClose = () => {
    stores.taskStore.setCurrentTask(null);
    setComment("");
    stores.commonStore.setTaskReviewDialogIsOpen(false);
  };

  const rejectOrApprove = (status: ApprovalStatus) => {
    stores.taskStore.currentTask &&
      stores.userAccountStore.currentUser &&
      completeTask(stores.taskStore.currentTask.id, status, comment).then(
        () => {
          handleClose();
          stores.taskStore.clearTasks();
          stores.taskStore.loadTasks(Tab.Inbox);
          stores.taskStore.loadNumberOfUncompletedTasks();
        }
      );
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
    <Dialog
      open={stores.commonStore.taskReviewDialogIsOpen}
      onClose={handleClose}
    >
      <DialogTitle>Review the files</DialogTitle>
      <DialogContent dividers>
        {stores.taskStore.currentTask && (
          <UserFilesList
            userFiles={stores.taskStore.currentTask.approvalRequest.userFiles}
          />
        )}
        {stores.commonStore.currentTab &&
          renderDialogInputs(stores.commonStore.currentTab)}
      </DialogContent>
      {stores.commonStore.currentTab &&
        renderDialogActions(stores.commonStore.currentTab)}
    </Dialog>
  );
};

export default observer(TaskReviewDialog);
