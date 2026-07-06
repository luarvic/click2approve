import {
  AttachFile,
  Close,
} from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import {
  LocalizationProvider,
  MobileDateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useRef, useState } from "react";
import { toast } from "react-toastify";
import { approvalRequestSubmit } from "../../lib/controllers/approvalRequest";
import { stores } from "../../stores/stores";
import { validateEmails } from "../../utils/validators";

const ApprovalRequestSubmitDialog = () => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [approvers, setApprovers] = useState<string[]>([]);
  const [approveBy, setApproveBy] = useState<Dayjs | null>(null);
  const [approversError, setApproversError] = useState(false);
  const [filesError, setFilesError] = useState(false);

  const handleUploadClick = () => {
    fileInput.current?.click();
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }

    setFiles((currentFiles) => [...currentFiles, ...selectedFiles]);
    setFilesError(false);
    event.currentTarget.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((currentFiles) => currentFiles.filter((_, i) => i !== index));
  };

  const handleApproversChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: (string | never[])[]
  ) => {
    setApproversError(false);
    setApprovers(value as string[]);
  };

  const handleAutocompleteFocusOut = (
    event: React.FormEvent<HTMLDivElement>
  ) => {
    const pressEnter = new KeyboardEvent("keydown", {
      code: "Enter",
      key: "Enter",
      charCode: 13,
      keyCode: 13,
      view: window,
      bubbles: true,
    });
    event.target.dispatchEvent(pressEnter);
  };

  const cleanUp = () => {
    setFiles([]);
    setApprovers([]);
    setApproveBy(null);
    setApproversError(false);
    setFilesError(false);
  };

  const handleClose = () => {
    stores.commonStore.setApprovalRequestSubmitDialogIsOpen(false);
    cleanUp();
  };

  return (
    <Dialog
      open={stores.commonStore.approvalRequestSubmitDialogIsOpen}
      onClose={handleClose}
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const comment = data.get("comment");
          if (files.length === 0) {
            setFilesError(true);
            toast.error("Add one or more files.");
          } else if (!validateEmails(approvers)) {
            setApproversError(true);
            toast.error("Invalid input.");
          } else {
            const uploadedFiles = await stores.userFileStore.addUserFiles(files);
            if (uploadedFiles.length !== files.length) {
              toast.error("One or more files could not be uploaded.");
              return;
            }

            const didSubmit = await approvalRequestSubmit(
              uploadedFiles,
              approvers.map((a) => a.toLowerCase().trim()),
              approveBy ? approveBy.toDate() : null,
              comment?.toString()
            );
            if (didSubmit) {
              stores.commonStore.setApprovalRequestSubmitDialogIsOpen(false);
              toast.success("The request was successfully sent");
              cleanUp();
              stores.approvalRequestStore.clearApprovalRequests();
              stores.approvalRequestStore.loadApprovalRequests();
              stores.approvalRequestTaskStore.loadNumberOfUncompletedTasks();
            }
          }
        },
      }}
    >
      <DialogTitle>New approval request</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 1 }}>
          <Button startIcon={<AttachFile />} onClick={handleUploadClick}>
            Add files
          </Button>
          <input
            type="file"
            multiple
            onChange={handleFilesChange}
            ref={fileInput}
            style={{ display: "none" }}
          />
        </Box>
        {files.length > 0 ? (
          <List dense disablePadding sx={{ mb: 1 }}>
            {files.map((file, index) => (
              <ListItem
                key={`${file.name}-${file.lastModified}-${index}`}
                disableGutters
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => handleRemoveFile(index)}
                  >
                    <Close />
                  </IconButton>
                }
              >
                <ListItemText primary={file.name} secondary={file.type} />
              </ListItem>
            ))}
          </List>
        ) : (
          <DialogContentText color={filesError ? "error" : "text.secondary"}>
            Add one or more files for review.
          </DialogContentText>
        )}
        <Autocomplete
          multiple
          options={[]}
          defaultValue={[]}
          freeSolo
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => (
              <Chip label={option} {...getTagProps({ index })} />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Email (press Enter to add multiple)"
              variant="standard"
              margin="normal"
              error={approversError}
              helperText={
                approversError && "Specify one or more valid email addresses"
              }
            />
          )}
          onChange={handleApproversChange}
          onBlur={handleAutocompleteFocusOut}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDateTimePicker
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "standard",
                required: false,
                margin: "normal",
              },
            }}
            label="Review by"
            value={approveBy}
            onChange={(newValue) => setApproveBy(newValue)}
          />
        </LocalizationProvider>
        <TextField
          id="comment"
          name="comment"
          margin="normal"
          fullWidth
          label="Comment"
          variant="standard"
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestSubmitDialog);
