import { InsertDriveFile } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  List,
  ListItem,
  ListItemIcon,
  TextField,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ApprovalRequestStatuses } from "../models/ApprovalRequestStatuses";
import { ApprovalRequestTypes } from "../models/ApprovalRequestTypes";
import { IUserFile } from "../models/UserFile";
import { approvalRequestStore } from "../stores/ApprovalRequestStore";
import { userAccountStore } from "../stores/UserAccountStore";
import { downloadUserFile } from "../utils/Downloaders";

// Send user files dialog.
const ApprovalRequestReviewDialog = () => {
  const {
    approvalRequestReviewDialogIsOpen,
    currentApprovalRequest,
    setApprovalRequestReviewDialogIsOpen,
    setCurrentApprovalRequest,
    handleApprovalRequest,
    clearApprovalRequests,
    loadApprovalRequests,
    loadNumberOfInboxApprovalRequests,
  } = approvalRequestStore;
  const { currentUser } = userAccountStore;
  const [comment, setComment] = useState<string>("");

  const handleClose = () => {
    setApprovalRequestReviewDialogIsOpen(false);
    setCurrentApprovalRequest(null);
  };

  const rejectOrApprove = (status: ApprovalRequestStatuses) => {
    setApprovalRequestReviewDialogIsOpen(false);
    currentApprovalRequest &&
      currentUser &&
      handleApprovalRequest(currentApprovalRequest, status, comment).then(
        () => {
          clearApprovalRequests();
          loadApprovalRequests(ApprovalRequestTypes.Inbox);
          loadNumberOfInboxApprovalRequests();
        }
      );
    setCurrentApprovalRequest(null);
  };

  const handleReject = () => {
    rejectOrApprove(ApprovalRequestStatuses.Rejected);
  };

  const handleApprove = () => {
    rejectOrApprove(ApprovalRequestStatuses.Approved);
  };

  return (
    <Dialog open={approvalRequestReviewDialogIsOpen} onClose={handleClose}>
      <DialogTitle>
        Review the file
        {currentApprovalRequest && currentApprovalRequest.userFiles.length > 1
          ? "s"
          : ""}
      </DialogTitle>
      <DialogContent dividers>
        <List>
          {currentApprovalRequest &&
            currentApprovalRequest.userFiles.map((userFile: IUserFile) => {
              return (
                <ListItem disableGutters>
                  <ListItemIcon>
                    <InsertDriveFile />
                  </ListItemIcon>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleReject}>Reject</Button>
        <Button onClick={handleApprove}>Approve</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestReviewDialog);
