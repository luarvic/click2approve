import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { approvalRequestStore } from "../../stores/approvalRequestStore";
import { commonStore } from "../../stores/commonStore";
import { deleteApprovalRequest } from "../../utils/apiClient";
import { UserFilesList } from "../lists/UserFilesList";
import { ApprovalSteps } from "../steps/ApprovalSteps";

const ApprovalRequestDeleteDialog = () => {
  const {
    approvalRequestDeleteDialogIsOpen,
    setApprovalRequestDeleteDialogIsOpen,
  } = commonStore;
  const {
    currentApprovalRequest,
    clearApprovalRequests,
    loadApprovalRequests,
  } = approvalRequestStore;

  const handleDelete = async () => {
    currentApprovalRequest &&
      deleteApprovalRequest(currentApprovalRequest.id).then(() => {
        handleClose();
        clearApprovalRequests();
        loadApprovalRequests();
      });
  };

  const handleClose = () => {
    setApprovalRequestDeleteDialogIsOpen(false);
  };

  return (
    <Dialog open={approvalRequestDeleteDialogIsOpen} onClose={handleClose}>
      <DialogTitle>Delete approval request</DialogTitle>
      <DialogContent dividers>
        {currentApprovalRequest && (
          <UserFilesList
            userFiles={currentApprovalRequest.userFiles}
            sx={{ mb: 1 }}
          />
        )}
        {currentApprovalRequest && (
          <ApprovalSteps approvalRequest={currentApprovalRequest} />
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
