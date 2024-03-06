import * as material from "@mui/material";
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
  const [approvers, setApprovers] = useState<string>("");
  const [approveBy, setApproveBy] = useState<Dayjs | null>(null);
  const [comment, setComment] = useState<string | null>(null);

  const handleSend = async () => {
    try {
      if (!approvers) {
        throw new Error("Approver email is not defined.");
      }
      if (!approveBy) {
        throw new Error("Approve by is not defined.");
      }
      await sendUserFiles(
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
    setComment(null);
    setSendDialogOpen(false);
  };

  return (
    <material.Modal open={getSendDialogOpen()} onClose={handleClose}>
      <material.Box sx={modalStyle}>
        <material.Grid container spacing={2}>
          <material.Grid item xs={12}>
            <material.Typography variant="h6" component="h2">
              Sending the file
              {userFileStore.getSelectedUserFiles().length > 1 ? "s" : ""} for
              approval
            </material.Typography>
          </material.Grid>
          <material.Grid item xs={12}>
            <material.Typography id="modal-modal-description">
              {userFileStore
                .getSelectedUserFiles()
                .map((userFile) => userFile.name)
                .join(", ")}
            </material.Typography>
          </material.Grid>
          <material.Grid item xs={12}>
            <material.TextField
              margin="normal"
              required
              fullWidth
              label="Approver Email"
              autoFocus
              value={approvers}
              onChange={(event) => setApprovers(event.currentTarget.value)}
            />
          </material.Grid>
          <material.Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                slotProps={{ textField: { fullWidth: true } }}
                value={approveBy}
                onChange={(newValue) => setApproveBy(newValue)}
                label="Approve by"
              />
            </LocalizationProvider>
          </material.Grid>
          <material.Grid item xs={12}>
            <material.TextField
              margin="normal"
              fullWidth
              label="Comment"
              value={comment}
              onChange={(event) => setComment(event.currentTarget.value)}
              multiline
              rows={4}
            />
          </material.Grid>
          <material.Grid item xs={6}>
            <material.Button
              type="submit"
              variant="contained"
              fullWidth
              onClick={handleSend}
            >
              Send
            </material.Button>
          </material.Grid>
          <material.Grid item xs={6}>
            <material.Button variant="outlined" fullWidth onClick={handleClose}>
              Close
            </material.Button>
          </material.Grid>
        </material.Grid>
      </material.Box>
    </material.Modal>
  );
};

export default observer(SendDialog);
