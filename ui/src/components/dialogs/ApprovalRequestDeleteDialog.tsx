import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { stores } from "../../stores/stores";
import { approvalRequestDelete } from "../../utils/apiClient";
import UserFilesList from "../lists/UserFilesList";
import ApprovalSteps from "../steps/ApprovalSteps";

const ApprovalRequestDeleteDialog = () => {
  const handleClose = () => {
    stores.commonStore.setApprovalRequestDeleteDialogIsOpen(false);
  };

  return (
    <Dialog
      open={stores.commonStore.approvalRequestDeleteDialogIsOpen}
      onClose={handleClose}
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          stores.commonStore.setApprovalRequestDeleteDialogIsOpen(false);
          stores.approvalRequestStore.currentApprovalRequest &&
            (await approvalRequestDelete(
              stores.approvalRequestStore.currentApprovalRequest.id
            ));
          stores.approvalRequestStore.clearApprovalRequests();
          stores.approvalRequestStore.loadApprovalRequests();
        },
      }}
    >
      <DialogTitle>Delete approval request</DialogTitle>
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestDeleteDialog);
