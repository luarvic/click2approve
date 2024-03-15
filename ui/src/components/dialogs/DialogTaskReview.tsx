import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { IApprovalRequest } from "../../models/ApprovalRequest";
import { ApprovalStatus } from "../../models/ApprovalStatus";
import { Tab } from "../../models/Tab";
import { IUserFile } from "../../models/UserFile";
import { commonStore } from "../../stores/CommonStore";
import { taskStore } from "../../stores/TaskStore";
import { userAccountStore } from "../../stores/UserAccountStore";
import { completeTask } from "../../utils/ApiClient";
import { downloadUserFile } from "../../utils/Downloaders";

const DialogTaskReview = () => {
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
    setTaskReviewDialogIsOpen(false);
    setCurrentTask(null);
  };

  const rejectOrApprove = (status: ApprovalStatus) => {
    setTaskReviewDialogIsOpen(false);
    currentTask &&
      currentUser &&
      completeTask(currentTask.id, status, comment).then(() => {
        clearTasks();
        loadTasks(Tab.Inbox);
        loadNumberOfUncompletedTasks();
      });
    setCurrentTask(null);
  };

  const handleReject = () => {
    rejectOrApprove(ApprovalStatus.Rejected);
  };

  const handleApprove = () => {
    rejectOrApprove(ApprovalStatus.Approved);
  };

  const renderDialogActions = (tab: Tab) => {
    const result: JSX.Element[] = [
      <Button onClick={handleClose}>Close</Button>,
    ];
    if (tab === Tab.Inbox) {
      result.push(<Button onClick={handleReject}>Reject</Button>);
      result.push(<Button onClick={handleApprove}>Approve</Button>);
    }
    return <DialogActions>{result}</DialogActions>;
  };

  const renderDialogInputs = (tab: Tab) => {
    const result: JSX.Element[] = [];
    if (tab === Tab.Inbox) {
      result.push(
        <TextField
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

  const renderApproveBy = (approvalRequest: IApprovalRequest) => {
    return (
      <Typography>{`Requested to approve by ${approvalRequest.approveByDate.toLocaleDateString()} ${approvalRequest.approveByDate.toLocaleTimeString()}`}</Typography>
    );
  };

  return (
    <Dialog open={taskReviewDialogIsOpen} onClose={handleClose}>
      <DialogTitle>Review</DialogTitle>
      <DialogContent dividers>
        {currentTask && renderApproveBy(currentTask.approvalRequest)}
        <List>
          {currentTask &&
            currentTask.approvalRequest.userFiles.map((userFile: IUserFile) => {
              return (
                <ListItem disablePadding>
                  <Link
                    component="button"
                    onClick={() => downloadUserFile(userFile)}
                  >
                    {userFile.name}
                  </Link>
                </ListItem>
              );
            })}
        </List>
        {renderDialogInputs(currentTab)}
      </DialogContent>
      {renderDialogActions(currentTab)}
    </Dialog>
  );
};

export default observer(DialogTaskReview);
