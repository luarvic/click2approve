import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  InputBase,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";
import { ACCEPT_FILE_TYPES } from "../stores/Constants";
import { userFileStore } from "../stores/UserFileStore";
import { downloadArchiveBase64, shareUserFiles } from "../utils/ApiClient";

// Submenu with Upload, Download, Share buttons.
export const Buttons = () => {
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [availableUntil, setAvailableUntil] = useState<Dayjs | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const { addUserFiles, getSelectedUserFiles } = userFileStore;

  const handleUploadClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget) {
      const filesToUpload = event.currentTarget.files;
      if (filesToUpload) {
        addUserFiles(filesToUpload);
      }
    }
  };

  const handleDownload = async () => {
    const base64String = await downloadArchiveBase64(getSelectedUserFiles());
    const a = document.createElement("a");
    a.hidden = true;
    a.href = base64String;
    a.setAttribute("download", "archive.zip");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
        toast.warn("Unable to share files.");
      }
    }
  };

  const handleCloseShareModal = () => {
    setShareLink("");
    setAvailableUntil(null);
    setShareOpen(false);
  };

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

  return (
    <Box sx={{ pb: 2 }}>
      <ButtonGroup variant="contained">
        <Button onClick={handleUploadClick}>Upload</Button>
        <input
          type="file"
          accept={ACCEPT_FILE_TYPES.join(", ")}
          multiple
          onChange={handleUpload}
          ref={hiddenFileInput}
          style={{ display: "none" }}
        />
        <Button
          onClick={handleDownload}
          disabled={getSelectedUserFiles().length > 0 ? false : true}
        >
          Download
        </Button>
        <Button
          onClick={() => setShareOpen(true)}
          disabled={getSelectedUserFiles().length > 0 ? false : true}
        >
          Share
        </Button>
      </ButtonGroup>
      <Modal open={shareOpen} onClose={handleCloseShareModal}>
        <Box sx={modalStyle}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" component="h2">
                Sharing the file(s) publicly
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
                  <InputBase
                    sx={{ ml: 1, flex: 1 }}
                    value={shareLink}
                    disabled
                  />
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
                Share
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleCloseShareModal}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </Box>
  );
};

export default observer(Buttons);
