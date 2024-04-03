import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
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
import { ApprovalStatus } from "../../models/approvalStatus";
import { Tab } from "../../models/tab";
import { stores } from "../../stores/Stores";
import { taskComplete } from "../../utils/apiClient";
import { UserFilesList } from "../lists/UserFilesList";

const TaskReviewDialog = () => {
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
            stores.taskStore.currentTask &&
              stores.userAccountStore.currentUser &&
              (await taskComplete(
                stores.taskStore.currentTask.id,
                decision === "approve"
                  ? ApprovalStatus.Approved
                  : ApprovalStatus.Rejected,
                comment?.toString()
              ));
            cleanUp();
            stores.taskStore.clearTasks();
            stores.taskStore.loadTasks(Tab.Inbox);
            stores.taskStore.loadNumberOfUncompletedTasks();
          }
        },
      }}
    >
      <DialogTitle>Review the file(s)</DialogTitle>
      <DialogContent dividers>
        {stores.taskStore.currentTask && (
          <UserFilesList
            userFiles={stores.taskStore.currentTask.approvalRequest.userFiles}
          />
        )}
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

export default observer(TaskReviewDialog);
