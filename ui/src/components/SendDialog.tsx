import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { toast } from "react-toastify";
import { commonStore } from "../stores/CommonStore";
import { userFileStore } from "../stores/UserFileStore";
import { submitApprovalRequest } from "../utils/ApiClient";

// Send user files dialog.
const SendDialog = () => {
  const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const { getSendDialogOpen, setSendDialogOpen } = commonStore;
  const { getSelectedUserFiles } = userFileStore;
  const [approvers, setApprovers] = useState<string>("");
  const [approveBy, setApproveBy] = useState<Dayjs | null>(null);
  const [comment, setComment] = useState<string>("");

  const handleSend = async () => {
    try {
      if (!approvers) {
        throw new Error("Approver email is not defined.");
      }
      if (!approveBy) {
        throw new Error("Approve by is not defined.");
      }
      await submitApprovalRequest(
        getSelectedUserFiles(),
        approvers.split(",").map((a) => a.toLocaleLowerCase().trim()),
        approveBy.toDate(),
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
    setComment("");
    setSendDialogOpen(false);
  };

  return (
    <Dialog open={getSendDialogOpen()} onClose={handleClose}>
      <DialogTitle>
        Sending the file
        {userFileStore.getSelectedUserFiles().length > 1 ? "s" : ""} for
        approval
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {userFileStore
            .getSelectedUserFiles()
            .map((userFile) => userFile.name)
            .join(", ")}
        </DialogContentText>
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
            slotProps={{ textField: { fullWidth: true, variant: "standard" } }}
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
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(SendDialog);
