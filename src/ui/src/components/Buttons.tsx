import { observer } from "mobx-react-lite";
import React, { useContext, useRef } from "react";
import { Button, Icon, Menu, MenuItem } from "semantic-ui-react";
import { userFileStoreContext } from "../stores/UserFileStore";

export const Buttons = () => {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const userFileStore = useContext(userFileStoreContext);
  const { addUserFiles } = userFileStore;

  const handleClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget) {
      const filesToUpload = event.currentTarget.files;
      if (filesToUpload) {
        addUserFiles(filesToUpload);
      }
    }
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
          onChange={handleChange}
          ref={hiddenFileInput}
          style={{ display: "none" }}
        />
      </MenuItem>
      <MenuItem>
        <Button disabled={true}>
          <Icon name="download" />
          Download
        </Button>
      </MenuItem>
      <MenuItem>
        <Button disabled={true}>
          <Icon name="share" />
          Share
        </Button>
      </MenuItem>
    </Menu>
  );
};

export default observer(Buttons);
