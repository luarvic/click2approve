import { observer } from "mobx-react-lite";
import React, { useContext, useRef } from "react";
import { Button, Icon, Menu, MenuItem } from "semantic-ui-react";
import { userFileStoreContext } from "../stores/UserFileStore";
import { downloadArchiveBase64 } from "../utils/ApiClient";

export const Buttons = () => {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const userFileStore = useContext(userFileStoreContext);
  const { addUserFiles, getSelectedUserFileIds } = userFileStore;

  const handleClick = () => {
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
    const base64String = await downloadArchiveBase64(getSelectedUserFileIds());
    const a = document.createElement("a");
    a.hidden = true;
    a.href = base64String;
    a.setAttribute("download", "archive.zip");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Menu text>
      <MenuItem>
        <Button primary onClick={handleClick}>
          <Icon name="upload" />
          Upload
        </Button>
        <input
          type="file"
          multiple
          onChange={handleUpload}
          ref={hiddenFileInput}
          style={{ display: "none" }}
        />
      </MenuItem>
      <MenuItem>
        <Button
          disabled={getSelectedUserFileIds().length > 0 ? false : true}
          onClick={handleDownload}
        >
          <Icon name="download" />
          Download
        </Button>
      </MenuItem>
      <MenuItem>
        <Button disabled={getSelectedUserFileIds().length > 0 ? false : true}>
          <Icon name="share" />
          Share
        </Button>
      </MenuItem>
    </Menu>
  );
};

export default observer(Buttons);
