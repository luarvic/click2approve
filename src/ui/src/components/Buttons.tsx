import { Box, Button, ButtonGroup } from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { commonStore } from "../stores/CommonStore";
import { ACCEPT_FILE_TYPES } from "../stores/Constants";
import { userFileStore } from "../stores/UserFileStore";
import { downloadArchiveBase64 } from "../utils/ApiClient";
import SendDialog from "./SendDialog";

// Submenu with Upload, Download, Share buttons.
export const Buttons = () => {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const { addUserFiles, getSelectedUserFiles } = userFileStore;
  const { setSendDialogOpen } = commonStore;
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
          onClick={() => setSendDialogOpen(true)}
          disabled={getSelectedUserFiles().length > 0 ? false : true}
        >
          Send
        </Button>
      </ButtonGroup>
      <SendDialog />
    </Box>
  );
};

export default observer(Buttons);
