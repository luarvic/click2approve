import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { stores } from "../../stores/Stores";
import { approvalRequestDelete } from "../../utils/apiClient";
import { UserFilesList } from "../lists/UserFilesList";
import { ApprovalSteps } from "../steps/ApprovalSteps";

const ApprovalRequestDeleteDialog = () => {
  const handleDelete = async () => {
    stores.approvalRequestStore.currentApprovalRequest &&
      approvalRequestDelete(
        stores.approvalRequestStore.currentApprovalRequest.id
      ).then(() => {
        handleClose();
        stores.approvalRequestStore.clearApprovalRequests();
        stores.approvalRequestStore.loadApprovalRequests();
      });
  };

  const handleClose = () => {
    stores.commonStore.setApprovalRequestDeleteDialogIsOpen(false);
  };

  return (
    <Dialog
      open={stores.commonStore.approvalRequestDeleteDialogIsOpen}
      onClose={handleClose}
    >
      <DialogTitle>Delete approval request</DialogTitle>
      <DialogContent dividers>
        {stores.approvalRequestStore.currentApprovalRequest && (
          <UserFilesList
            userFiles={
              stores.approvalRequestStore.currentApprovalRequest.userFiles
            }
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" onClick={handleDelete} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestDeleteDialog);
