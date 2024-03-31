import { CloudUpload } from "@mui/icons-material";
import { Button } from "@mui/material";
import { observer } from "mobx-react-lite";
import { ChangeEvent, Fragment, useRef } from "react";
import { fileStore } from "../../stores/fileStore";

const ButtonUpload = () => {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const { addUserFiles } = fileStore;
  const handleUploadClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget) {
      const filesToUpload = event.currentTarget.files;
      if (filesToUpload) {
        addUserFiles(filesToUpload);
      }
    }
  };

  return (
    <>
      <Button
        size="small"
        variant="contained"
        startIcon={<CloudUpload />}
        onClick={handleUploadClick}
      >
        Upload
      </Button>
      <input
        type="file"
        multiple
        onChange={handleUpload}
        ref={hiddenFileInput}
        style={{ display: "none" }}
      />
    </>
  );
};

export default observer(ButtonUpload);
