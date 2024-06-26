import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { taskComplete } from "../../lib/controllers/approvalRequestTask";
import { ApprovalStatus } from "../../models/approvalStatus";
import { Tab } from "../../models/tab";
import { stores } from "../../stores/stores";
import { getLocaleDateTimeString } from "../../utils/helpers";
import UserFilesList from "../lists/UserFilesList";
import CommentPaper from "../papers/CommentPaper";

const UncompletedTaskReviewDialog = () => {
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
      PaperProps={{
        component: "form",
        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const comment = data.get("comment");
          const decision = data.get("decision");
          if (!decision) {
            setDecisionError(true);
          } else {
            stores.commonStore.setTaskReviewDialogIsOpen(false);
            stores.approvalRequestTaskStore.currentTask &&
              stores.userAccountStore.currentUser &&
              (await taskComplete(
                stores.approvalRequestTaskStore.currentTask.id,
                decision === "approve"
                  ? ApprovalStatus.Approved
                  : ApprovalStatus.Rejected,
                comment?.toString()
              ));
            cleanUp();
            stores.approvalRequestTaskStore.clearTasks();
            stores.approvalRequestTaskStore.loadTasks(Tab.Inbox);
            stores.approvalRequestTaskStore.loadNumberOfUncompletedTasks();
          }
        },
      }}
    >
      <DialogTitle>Review the file(s)</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          {stores.approvalRequestTaskStore.currentTask?.approvalRequest.author.toLowerCase()}{" "}
          on{" "}
          {getLocaleDateTimeString(
            stores.approvalRequestTaskStore.currentTask?.approvalRequest
              .submittedDate
          )}{" "}
          requested you to review the following file(s):
        </DialogContentText>
        <UserFilesList
          userFiles={
            stores.approvalRequestTaskStore.currentTask?.approvalRequest
              .userFiles
          }
          direction="column"
          sx={{ my: 1 }}
        />
        {stores.approvalRequestTaskStore.currentTask?.approvalRequest
          .approveBy && (
          <DialogContentText>
            by{" "}
            {getLocaleDateTimeString(
              stores.approvalRequestTaskStore.currentTask?.approvalRequest
                .approveByDate
            )}
          </DialogContentText>
        )}
        <CommentPaper
          text={
            stores.approvalRequestTaskStore.currentTask?.approvalRequest.comment
          }
          sx={{ my: 1 }}
        />
        <FormControl key="decision" error={decisionError}>
          <RadioGroup
            row
            name="decision"
            onChange={() => setDecisionError(false)}
          >
            <FormControlLabel
              value="approve"
              control={<Radio />}
              label="Approve"
            />
            <FormControlLabel
              value="reject"
              control={<Radio />}
              label="Reject"
            />
          </RadioGroup>
          {decisionError && (
            <FormHelperText sx={{ mx: 0 }}>
              You should either approve or reject
            </FormHelperText>
          )}
        </FormControl>
        <TextField
          key="comment"
          id="comment"
          name="comment"
          margin="normal"
          fullWidth
          label="Comment"
          autoFocus
          variant="standard"
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button key="Cancel" onClick={handleClose}>
          Cancel
        </Button>
        <Button key="Submit" type="submit">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(UncompletedTaskReviewDialog);
