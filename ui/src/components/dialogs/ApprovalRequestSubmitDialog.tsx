import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { toast } from "react-toastify";
import { stores } from "../../stores/stores";
import { approvalRequestSubmit } from "../../utils/apiClient";
import { validateEmails } from "../../utils/validators";
import UserFilesList from "../lists/UserFilesList";

const ApprovalRequestSubmitDialog = () => {
  const [approvers, setApprovers] = useState<string[]>([]);
  const [approveBy, setApproveBy] = useState<Dayjs | null>(null);
  const [approversError, setApproversError] = useState(false);

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
    var pressEnter = new KeyboardEvent("keydown", {
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
    setApprovers([]);
    setApproveBy(null);
    setApproversError(false);
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
          if (!validateEmails(approvers)) {
            setApproversError(true);
            toast.error("Invalid input.");
          } else {
            stores.commonStore.setApprovalRequestSubmitDialogIsOpen(false);
            await approvalRequestSubmit(
              stores.fileStore.getSelectedUserFiles(),
              approvers.map((a) => a.toLocaleLowerCase().trim()),
              approveBy ? approveBy.toDate() : null,
              comment?.toString()
            );
            cleanUp();
          }
        },
      }}
    >
      <DialogTitle>Send file(s)</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          You are about to send the following file(s) for review:
        </DialogContentText>
        <UserFilesList
          userFiles={stores.fileStore.getSelectedUserFiles()}
          direction="column"
          sx={{ my: 1 }}
        />
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
                approversError && "Specify one ore more valid email addresses"
              }
            />
          )}
          onChange={handleApproversChange}
          onBlur={handleAutocompleteFocusOut}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
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
