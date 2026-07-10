import { stores } from "@/app/rootStore";
import { cancelApprovalRequest } from "@/features/approvalRequests/api/approvalRequestApi";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import UserFilesList from "@/features/userFiles/components/UserFilesList";
import CommentPaper from "@/shared/components/papers/CommentPaper";
import { Dialogs, Flex, StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";

const getStatusChipColor = (status: ApprovalRequestStatus) => {
  switch (status) {
    case ApprovalRequestStatus.Approved:
      return "success" as const;
    case ApprovalRequestStatus.Rejected:
      return "error" as const;
    case ApprovalRequestStatus.Cancelled:
      return "default" as const;
    default:
      return "warning" as const;
  }
};

const ApprovalRequestViewDialog = () => {
  const approvalRequest = stores.approvalRequestStore.currentApprovalRequest;

  const handleClose = () => {
    stores.commonStore.setApprovalRequestViewDialogIsOpen(false);
    stores.approvalRequestStore.setCurrent(null);
  };

  const handleClone = () => {
    if (!approvalRequest) {
      return;
    }

    stores.approvalRequestStore.setRequestToClone(approvalRequest);
    stores.commonStore.setApprovalRequestViewDialogIsOpen(false);
    stores.commonStore.setApprovalRequestSubmitDialogIsOpen(true);
  };

  const handleCancel = async () => {
    if (!approvalRequest) {
      return;
    }

    if (await cancelApprovalRequest(approvalRequest.id)) {
      stores.approvalRequestStore.clear();
      stores.approvalRequestStore.load();
      handleClose();
    }
  };

  const handleEditSteps = () => {
    stores.commonStore.setApprovalRequestStepsDialogIsOpen(true);
  };

  const canCancel = approvalRequest?.status === ApprovalRequestStatus.Submitted;

  return (
    <Dialog
      open={stores.commonStore.approvalRequestViewDialogIsOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Stack
          direction="row"
          spacing={StackSpacing.default}
          alignItems="center"
        >
          <Typography variant="h6" sx={Flex.growSx}>
            {approvalRequest?.title ?? "Approval request"}
          </Typography>
          {approvalRequest && (
            <Chip
              label={ApprovalRequestStatus[approvalRequest.status]}
              size="small"
              color={getStatusChipColor(approvalRequest.status)}
            />
          )}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Created on {getLocaleDateTimeString(approvalRequest?.createdAtDate)}
        </DialogContentText>
        {approvalRequest?.clonedFromApprovalRequestId && (
          <DialogContentText>Cloned from another request</DialogContentText>
        )}
        <UserFilesList
          userFiles={approvalRequest?.userFiles}
          direction="column"
          sx={Dialogs.sectionSx}
        />
        {approvalRequest?.approveBy && (
          <DialogContentText>
            Review by {getLocaleDateTimeString(approvalRequest.approveByDate)}
          </DialogContentText>
        )}
        <CommentPaper
          text={approvalRequest?.comment}
          label="Requester comment"
          sx={Dialogs.sectionSx}
        />
        {approvalRequest && (
          <ApprovalSteps
            approvalRequest={approvalRequest}
            sx={Dialogs.sectionSx}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClone}>Clone</Button>
        {canCancel && <Button onClick={handleEditSteps}>Edit steps</Button>}
        {canCancel && <Button onClick={handleCancel}>Cancel request</Button>}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestViewDialog);
