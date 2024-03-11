import { Box, Button, ButtonGroup } from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { commonStore } from "../stores/CommonStore";
import { userFileStore } from "../stores/UserFileStore";
import SendDialog from "./SendDialog";

// Submenu with Upload, Download, Share buttons.
const Buttons = () => {
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

  return (
    <Box sx={{ pb: 2 }}>
      <ButtonGroup variant="contained">
        <Button onClick={handleUploadClick}>Upload</Button>
        <input
          type="file"
          multiple
          onChange={handleUpload}
          ref={hiddenFileInput}
          style={{ display: "none" }}
        />
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
