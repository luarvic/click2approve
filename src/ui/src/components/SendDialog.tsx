import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputBase,
  Modal,
  Paper,
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
import { shareUserFiles } from "../utils/ApiClient";

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
  const [availableUntil, setAvailableUntil] = useState<Dayjs | null>(null);
  const [shareLink, setShareLink] = useState<string>("");

  const handleShare = async () => {
    try {
      if (availableUntil) {
        const link = await shareUserFiles(
          getSelectedUserFiles(),
          availableUntil.toDate()
        );
        setShareLink(`${window.location.origin}/file/${link}`);
      } else {
        throw new Error("Date is not defined.");
      }
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to send files.");
      }
    }
  };

  const handleClose = () => {
    setShareLink("");
    setAvailableUntil(null);
    setSendDialogOpen(false);
  };

  return (
    <Modal open={getSendDialogOpen()} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" component="h2">
              Sending the file(s)
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
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                slotProps={{ textField: { fullWidth: true } }}
                value={availableUntil}
                onChange={(newValue) => setAvailableUntil(newValue)}
              />
            </LocalizationProvider>
          </Grid>
          {shareLink && (
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#f5f5f5",
                }}
              >
                <InputBase sx={{ ml: 1, flex: 1 }} value={shareLink} disabled />
                <IconButton
                  color="primary"
                  sx={{ p: "10px" }}
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    toast.info("Link copied");
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Paper>
            </Grid>
          )}
          <Grid item xs={6}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              onClick={handleShare}
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
