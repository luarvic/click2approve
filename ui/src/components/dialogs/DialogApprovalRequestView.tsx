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
import { ListUserFiles } from "../lists/ListUserFiles";
import { StepsApproval } from "../steps/StepsApproval";

const DialogApprovalRequestView = () => {
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
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(DialogApprovalRequestView);
