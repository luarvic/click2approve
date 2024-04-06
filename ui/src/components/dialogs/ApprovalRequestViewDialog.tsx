import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { stores } from "../../stores/stores";
import { getLocaleDateTimeString } from "../../utils/converters";
import UserFilesList from "../lists/UserFilesList";
import CommentPaper from "../papers/CommentPaper";
import ApprovalSteps from "../steps/ApprovalSteps";

const ApprovalRequestViewDialog = () => {
  const handleClose = () => {
    stores.commonStore.setApprovalRequestViewDialogIsOpen(false);
    stores.approvalRequestStore.setCurrentApprovalRequest(null);
  };

  return (
    <Dialog
      open={stores.commonStore.approvalRequestViewDialogIsOpen}
      onClose={handleClose}
      fullWidth
    >
      <DialogTitle>Track approval request</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          On{" "}
          {getLocaleDateTimeString(
            stores.approvalRequestStore.currentApprovalRequest?.submittedDate
          )}{" "}
          you requested to review the following file(s):
        </DialogContentText>
        <UserFilesList
          userFiles={
            stores.approvalRequestStore.currentApprovalRequest?.userFiles
          }
          direction="column"
          sx={{ my: 1 }}
        />
        {stores.approvalRequestStore.currentApprovalRequest?.approveBy && (
          <DialogContentText>
            by{" "}
            {getLocaleDateTimeString(
              stores.approvalRequestStore.currentApprovalRequest?.approveByDate
            )}
          </DialogContentText>
        )}
        <CommentPaper
          text={stores.approvalRequestStore.currentApprovalRequest?.comment}
          sx={{ my: 1 }}
        />
        <DialogContentText>from the following contact(s):</DialogContentText>
        {stores.approvalRequestStore.currentApprovalRequest && (
          <ApprovalSteps
            approvalRequest={stores.approvalRequestStore.currentApprovalRequest}
            sx={{ my: 1 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestViewDialog);
