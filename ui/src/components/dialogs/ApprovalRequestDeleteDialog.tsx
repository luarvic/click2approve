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
import { approvalRequestDelete } from "../../utils/apiClient";
import { getLocaleDateTimeString } from "../../utils/converters";
import UserFilesList from "../lists/UserFilesList";
import CommentPaper from "../papers/CommentPaper";
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
              stores.taskStore.currentTask?.approvalRequest.approveByDate
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestDeleteDialog);
