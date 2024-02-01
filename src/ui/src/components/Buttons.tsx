import { observer } from "mobx-react-lite";
import React, { useContext, useRef, useState } from "react";
import { toast } from "react-toastify";
import { DateTimeInput } from "semantic-ui-calendar-react-yz";
import {
  Button,
  Container,
  Form,
  FormField,
  Icon,
  Input,
  Menu,
  MenuItem,
  Modal,
  ModalActions,
  ModalContent,
  ModalHeader,
} from "semantic-ui-react";
import { userFileStoreContext } from "../stores/UserFileStore";
import { downloadArchiveBase64, shareUserFiles } from "../utils/ApiClient";
import { ACCEPT_FILE_TYPES } from "../stores/Constants";

export const Buttons = () => {
  const [shareOpen, setShareOpen] = useState<boolean>(false);
  const [availableUntil, setAvailableUntil] = useState<string>("");
  const [shareLink, setShareLink] = useState<string>("");
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const userFileStore = useContext(userFileStoreContext);
  const { addUserFiles, getSelectedUserFiles, incrementDownloadCount } =
    userFileStore;

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
    incrementDownloadCount();
    const a = document.createElement("a");
    a.hidden = true;
    a.href = base64String;
    a.setAttribute("download", "archive.zip");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    const link = await shareUserFiles(
      getSelectedUserFiles(),
      new Date(availableUntil)
    );
    setShareLink(`${window.location.origin}/file/${link}`);
  };

  const handleDatetimePicker = (event: any, data: any) => {
    setAvailableUntil(data.value);
  };

  const handleCloseShareModal = () => {
    setShareLink("");
    setShareOpen(false);
  };

  return (
    <Container>
      <Menu text>
        <MenuItem>
          <Button primary onClick={handleUploadClick}>
            <Icon name="upload" />
            Upload
          </Button>
          <input
            type="file"
            accept={ACCEPT_FILE_TYPES.join(", ")}
            multiple
            onChange={handleUpload}
            ref={hiddenFileInput}
            style={{ display: "none" }}
          />
        </MenuItem>
        <MenuItem>
          <Button
            disabled={getSelectedUserFiles().length > 0 ? false : true}
            onClick={handleDownload}
          >
            <Icon name="download" />
            Download
          </Button>
        </MenuItem>
        <MenuItem>
          <Button
            disabled={getSelectedUserFiles().length > 0 ? false : true}
            onClick={() => setShareOpen(true)}
          >
            <Icon name="share" />
            Share
          </Button>
        </MenuItem>
      </Menu>
      <Modal dimmer="inverted" open={shareOpen} size="tiny">
        <ModalHeader>Sharing the file(s) publicly</ModalHeader>
        <ModalContent>
          <p>
            {userFileStore
              .getSelectedUserFiles()
              .map((userFile) => userFile.name)
              .join(", ")}
          </p>
          <p>
            <Form>
              <FormField>
                <label>Available until </label>
                <DateTimeInput
                  closable
                  name="date"
                  placeholder="Date Time"
                  dateFormat="YYYY-MM-DD"
                  value={availableUntil}
                  iconPosition="right"
                  onChange={handleDatetimePicker}
                />
              </FormField>
            </Form>
          </p>
          {shareLink && (
            <p>
              <Input
                visible={false}
                disabled
                fluid
                label={
                  <Button
                    content="Copy"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      toast.info("Link copied");
                    }}
                  />
                }
                labelPosition="right"
                value={shareLink}
              />
            </p>
          )}
        </ModalContent>
        <ModalActions>
          <Button positive onClick={handleShare}>
            Create link
          </Button>
          <Button onClick={handleCloseShareModal}>Close</Button>
        </ModalActions>
      </Modal>
    </Container>
  );
};

export default observer(Buttons);
