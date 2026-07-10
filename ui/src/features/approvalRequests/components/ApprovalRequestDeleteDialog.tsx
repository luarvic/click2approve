import { stores } from "@/app/rootStore";
import { deleteApprovalRequest } from "@/features/approvalRequests/api/approvalRequestApi";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import UserFilesList from "@/features/userFiles/components/UserFilesList";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { Dialogs } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { observer } from "mobx-react-lite";

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
          if (stores.approvalRequestStore.currentApprovalRequest) {
            const didDelete = await deleteApprovalRequest(
              stores.approvalRequestStore.currentApprovalRequest.id,
            );
            if (didDelete) {
              stores.commonStore.setApprovalRequestDeleteDialogIsOpen(false);
              stores.approvalRequestStore.clear();
              stores.approvalRequestStore.load();
            }
          } else {
            stores.commonStore.setApprovalRequestDeleteDialogIsOpen(false);
          }
        },
      }}
    >
      <DialogTitle>Delete approval request</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {stores.approvalRequestStore.currentApprovalRequest?.title}
        </DialogContentText>
        <DialogContentText>
          On{" "}
          {getLocaleDateTimeString(
            stores.approvalRequestStore.currentApprovalRequest?.createdAtDate,
          )}{" "}
          you requested to review the following file(s):
        </DialogContentText>
        <UserFilesList
          userFiles={
            stores.approvalRequestStore.currentApprovalRequest?.userFiles
          }
          direction="column"
          sx={Dialogs.sectionSx}
        />
        {stores.approvalRequestStore.currentApprovalRequest?.approveBy && (
          <DialogContentText>
            by{" "}
            {getLocaleDateTimeString(stores.approvalRequestStore.currentApprovalRequest?.approveByDate)}
          </DialogContentText>
        )}
        <CommentPaper
          text={stores.approvalRequestStore.currentApprovalRequest?.comment}
          sx={Dialogs.sectionSx}
        />
        <DialogContentText>from the following contact(s):</DialogContentText>
        {stores.approvalRequestStore.currentApprovalRequest && (
          <ApprovalSteps
            approvalRequest={stores.approvalRequestStore.currentApprovalRequest}
            sx={Dialogs.sectionSx}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit">Delete</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestDeleteDialog);
