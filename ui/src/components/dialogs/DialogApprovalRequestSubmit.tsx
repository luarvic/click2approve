import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { toast } from "react-toastify";
import { commonStore } from "../../stores/CommonStore";
import { fileStore } from "../../stores/FileStore";
import { submitApprovalRequest } from "../../utils/ApiClient";
import { ListUserFiles } from "../lists/ListUserFiles";

const DialogApprovalRequestSubmit = () => {
  const {
    approvalRequestSubmitDialogIsOpen,
    setApprovalRequestSubmitDialogIsOpen,
  } = commonStore;
  const { getSelectedUserFiles } = fileStore;
  const [approvers, setApprovers] = useState<string>("");
  const [approveBy, setApproveBy] = useState<Dayjs | null>(null);
  const [comment, setComment] = useState<string | null>(null);

  const handleSend = async () => {
    try {
      if (!approvers) {
        throw new Error("Approver email is not defined.");
      }
      await submitApprovalRequest(
        getSelectedUserFiles(),
        approvers.split(",").map((a) => a.toLocaleLowerCase().trim()),
        approveBy ? approveBy.toDate() : null,
        comment
      );
      handleClose();
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to send files.");
      }
    }
  };

  const handleClose = () => {
    setApprovers("");
    setApproveBy(null);
    setComment(null);
    setApprovalRequestSubmitDialogIsOpen(false);
  };

  return (
    <Dialog open={approvalRequestSubmitDialogIsOpen} onClose={handleClose}>
      <DialogTitle>Submit for approval</DialogTitle>
      <DialogContent dividers>
        <ListUserFiles userFiles={getSelectedUserFiles()} />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Approver Email"
          autoFocus
          variant="standard"
          value={approvers}
          onChange={(event) => setApprovers(event.currentTarget.value)}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "standard",
                required: false,
              },
            }}
            value={approveBy}
            onChange={(newValue) => setApproveBy(newValue)}
            label="Approve by"
          />
        </LocalizationProvider>
        <TextField
          margin="normal"
          fullWidth
          label="Comment"
          variant="standard"
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" onClick={handleSend}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(DialogApprovalRequestSubmit);
