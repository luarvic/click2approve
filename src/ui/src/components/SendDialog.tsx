import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputBase,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { toast } from "react-toastify";
import { commonStore } from "../stores/CommonStore";
import { userFileStore } from "../stores/UserFileStore";
import { sendUserFiles } from "../utils/ApiClient";

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
  const [approveBy, setApproveBy] = useState<Dayjs | null>(null);
  const [approvers, setApprovers] = useState<string>("");

  const handleSend = async () => {
    try {
      if (!approvers) {
        throw new Error("Approver email is not defined.");
      }
      if (!approveBy) {
        throw new Error("Approve by is not defined.");
      }
      const link = await sendUserFiles(
        getSelectedUserFiles(),
        approvers.split(",").map((a) => a.toLocaleLowerCase().trim()),
        approveBy.toDate()
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
    setSendDialogOpen(false);
  };

  return (
    <Modal open={getSendDialogOpen()} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" component="h2">
              Sending the file
              {userFileStore.getSelectedUserFiles().length > 1 ? "s" : ""} for
              approval
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography id="modal-modal-description">
              {userFileStore
                .getSelectedUserFiles()
                .map((userFile) => userFile.name)
                .join(", ")}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Approver Email"
              autoFocus
              value={approvers}
              onChange={(event) => setApprovers(event.currentTarget.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                slotProps={{ textField: { fullWidth: true } }}
                value={approveBy}
                onChange={(newValue) => setApproveBy(newValue)}
                label="Approve by"
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={6}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              onClick={handleSend}
            >
              Send
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button variant="outlined" fullWidth onClick={handleClose}>
              Close
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default observer(SendDialog);
