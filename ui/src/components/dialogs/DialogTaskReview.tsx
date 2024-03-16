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
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
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
  const [comment, setComment] = useState<string | null>("");

  const handleClose = () => {
    setCurrentTask(null);
    setComment(null);
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
      <Button onClick={handleClose}>Cancel</Button>,
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

  return (
    <Dialog open={taskReviewDialogIsOpen} onClose={handleClose}>
      <DialogTitle>Review the files</DialogTitle>
      <DialogContent dividers>
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
