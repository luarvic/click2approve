import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { stores } from "../../stores/Stores";
import UserFilesList from "../lists/UserFilesList";
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
        {stores.approvalRequestStore.currentApprovalRequest && (
          <UserFilesList
            userFiles={
              stores.approvalRequestStore.currentApprovalRequest.userFiles
            }
            direction="column"
            sx={{ mb: 1 }}
          />
        )}
        {stores.approvalRequestStore.currentApprovalRequest && (
          <ApprovalSteps
            approvalRequest={stores.approvalRequestStore.currentApprovalRequest}
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
