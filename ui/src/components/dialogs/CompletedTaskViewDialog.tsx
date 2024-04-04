import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { ApprovalStatus } from "../../models/approvalStatus";
import { stores } from "../../stores/Stores";
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
      <DialogTitle>You reviewed the file(s)</DialogTitle>
      <DialogContent dividers>
        <UserFilesList
          userFiles={stores.taskStore.currentTask?.approvalRequest.userFiles}
          direction="column"
          sx={{ mb: 1 }}
        />
        <CommentPaper
          text={stores.taskStore.currentTask?.approvalRequest.comment}
        />
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
        <Typography>{`on ${getLocaleDateTimeString(
          stores.taskStore.currentTask?.completedDate
        )}`}</Typography>
        <CommentPaper
          text={stores.taskStore.currentTask?.comment}
          sx={{ mt: 1 }}
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
