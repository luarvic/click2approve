import { stores } from "@/app/rootStore";
import { completeApprovalRequestTask } from "@/features/approvalRequests/api/approvalRequestTaskApi";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import UserFilesList from "@/features/userFiles/components/UserFilesList";
import { Dialogs } from "@/shared/constants/constants";
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
import TaskRequestDetailsAccordion from "./TaskRequestDetailsAccordion";

const UncompletedTaskReviewDialog = () => {
  const [decisionError, setDecisionError] = useState(false);
  const currentTask = stores.approvalRequestTaskStore.currentTask;
  const canViewRequest = currentTask?.canViewRequest !== false;

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
            if (
              stores.approvalRequestTaskStore.currentTask &&
              stores.userAccountStore.currentUser
            ) {
              const didComplete = await completeApprovalRequestTask(
                stores.approvalRequestTaskStore.currentTask.id,
                decision === "approve"
                  ? ApprovalRequestTaskStatus.Approved
                  : ApprovalRequestTaskStatus.Rejected,
                comment?.toString(),
              );
              if (didComplete) {
                stores.commonStore.setTaskReviewDialogIsOpen(false);
                cleanUp();
                stores.approvalRequestTaskStore.clear();
                stores.approvalRequestTaskStore.loadIncoming();
                stores.approvalRequestTaskStore.loadUncompletedCount();
              }
            }
          }
        },
      }}
    >
      <DialogTitle>Review the file(s)</DialogTitle>
      <DialogContent>
        <DialogContentText>Review the following file(s):</DialogContentText>
        <UserFilesList
          userFiles={currentTask?.approvalRequest.userFiles}
          direction="column"
          sx={Dialogs.sectionSx}
        />
        {canViewRequest && (
          <TaskRequestDetailsAccordion
            approvalRequest={currentTask?.approvalRequest}
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
            <FormHelperText sx={Dialogs.fieldHelperTextSx}>
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
          rows={Dialogs.commentTextFieldRows}
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
