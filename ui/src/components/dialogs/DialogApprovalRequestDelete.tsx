import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { approvalRequestStore } from "../../stores/ApprovalRequestStore";
import { commonStore } from "../../stores/CommonStore";
import { deleteApprovalRequest } from "../../utils/ApiClient";
import { ListUserFiles } from "../lists/ListUserFiles";
import { StepsApproval } from "../steps/StepsApproval";

const DialogApprovalRequestDelete = () => {
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
          <ListUserFiles
            userFiles={currentApprovalRequest.userFiles}
            sx={{ mb: 1 }}
          />
        )}
        {currentApprovalRequest && (
          <StepsApproval approvalRequest={currentApprovalRequest} />
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

export default observer(DialogApprovalRequestDelete);
