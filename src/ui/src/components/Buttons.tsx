import React, { useContext, useRef } from "react";
import { Button, Icon, Menu, MenuItem } from "semantic-ui-react";
import { uploadFiles } from "../utils/ApiClient";
import { toast } from "react-toastify";
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
        const fileNames = Array.from(filesToUpload, (file) => file.name);
        toast.info(`Uploading file(s): ${fileNames.toString()}`, {});
        uploadFiles(filesToUpload).then((result) => {
          addUserFiles(result);
          toast.success(`File(s) uploaded: ${fileNames.toString()}`);
        });
      }
    }
  };

  return (
    <Menu secondary>
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

export default Buttons;
