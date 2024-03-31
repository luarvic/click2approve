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
import { UserFilesList } from "../lists/UserFilesList";
import { ApprovalSteps } from "../steps/ApprovalSteps";

const ApprovalRequestViewDialog = () => {
  const {
    approvalRequestViewDialogIsOpen,
    setApprovalRequestViewDialogIsOpen,
  } = commonStore;
  const { currentApprovalRequest, setCurrentApprovalRequest } =
    approvalRequestStore;

  const handleClose = () => {
    setApprovalRequestViewDialogIsOpen(false);
    setCurrentApprovalRequest(null);
  };

  return (
    <Dialog open={approvalRequestViewDialogIsOpen} onClose={handleClose}>
      <DialogTitle>Track approval request</DialogTitle>
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
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestViewDialog);
