import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ApprovalStatus } from "../../models/approvalStatus";
import { stores } from "../../stores/stores";
import { getLocaleDateTimeString } from "../../utils/converters";
import UserFilesList from "../lists/UserFilesList";
import CommentPaper from "../papers/CommentPaper";

const CompletedTaskViewDialog = () => {
  const [decisionError, setDecisionError] = useState(false);

  const cleanUp = () => {
    setDecisionError(false);
  };

  const handleClose = () => {
    stores.commonStore.setTaskReviewDialogIsOpen(false);
    cleanUp();
  };

  return (
    <Dialog
      open={stores.commonStore.taskReviewDialogIsOpen}
      onClose={handleClose}
      fullWidth
    >
      <DialogTitle>Reviewed file(s)</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          {stores.taskStore.currentTask?.approvalRequest.author.toLowerCase()}{" "}
          on{" "}
          {getLocaleDateTimeString(
            stores.taskStore.currentTask?.approvalRequest.submittedDate
          )}{" "}
          requested you to review the following file(s):
        </DialogContentText>

        <UserFilesList
          userFiles={stores.taskStore.currentTask?.approvalRequest.userFiles}
          direction="column"
          sx={{ my: 1 }}
        />
        {stores.taskStore.currentTask?.approvalRequest.approveBy && (
          <DialogContentText>
            by{" "}
            {getLocaleDateTimeString(
              stores.taskStore.currentTask?.approvalRequest.approveByDate
            )}
          </DialogContentText>
        )}
        <CommentPaper
          text={stores.taskStore.currentTask?.approvalRequest.comment}
          sx={{ my: 1 }}
        />
        <DialogContentText>
          On{" "}
          {getLocaleDateTimeString(stores.taskStore.currentTask?.completedDate)}{" "}
          you
        </DialogContentText>
        <FormControl key="decision" error={decisionError}>
          <RadioGroup
            row
            name="decision"
            value={
              stores.taskStore.currentTask?.status === ApprovalStatus.Approved
                ? "approved"
                : "rejected"
            }
          >
            <FormControlLabel
              value="approved"
              control={<Radio />}
              label="Approved"
              disabled
            />
            <FormControlLabel
              value="rejected"
              control={<Radio />}
              label="Rejected"
              disabled
            />
          </RadioGroup>
        </FormControl>
        <CommentPaper
          text={stores.taskStore.currentTask?.comment}
          sx={{ my: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button key="Cancel" onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(CompletedTaskViewDialog);
