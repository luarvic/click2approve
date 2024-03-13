import { InsertDriveFile } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  List,
  ListItem,
  ListItemIcon,
  TextField,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { toast } from "react-toastify";
import { IUserFile } from "../models/UserFile";
import { approvalRequestStore } from "../stores/ApprovalRequestStore";
import { userFileStore } from "../stores/UserFileStore";
import { submitApprovalRequest } from "../utils/ApiClient";
import { downloadUserFile } from "../utils/Downloaders";

// Send user files dialog.
const ApprovalRequestSubmitDialog = () => {
  const {
    approvalRequestSubmitDialogIsOpen,
    setApprovalRequestSubmitDialogIsOpen,
  } = approvalRequestStore;
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
    setApprovalRequestSubmitDialogIsOpen(false);
  };

  return (
    <Dialog open={approvalRequestSubmitDialogIsOpen} onClose={handleClose}>
      <DialogTitle>
        Send the file
        {userFileStore.getSelectedUserFiles().length > 1 ? "s" : ""} for
        approval
      </DialogTitle>
      <DialogContent dividers>
        <List>
          {userFileStore.getSelectedUserFiles().map((userFile: IUserFile) => (
            <ListItem disableGutters>
              <ListItemIcon>
                <InsertDriveFile />
              </ListItemIcon>
              <Link
                component="button"
                onClick={() => downloadUserFile(userFile)}
              >
                {userFile.name}
              </Link>
            </ListItem>
          ))}
        </List>
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

export default observer(ApprovalRequestSubmitDialog);
