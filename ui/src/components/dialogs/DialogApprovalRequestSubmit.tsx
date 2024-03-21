import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import { commonStore } from "../../stores/CommonStore";
import { EMAIL_VALIDATION_REGEX } from "../../stores/Constants";
import { fileStore } from "../../stores/FileStore";
import { submitApprovalRequest } from "../../utils/ApiClient";
import { ListUserFiles } from "../lists/ListUserFiles";
import { validateEmails } from "../../utils/Validators";

const DialogApprovalRequestSubmit = () => {
  const {
    approvalRequestSubmitDialogIsOpen,
    setApprovalRequestSubmitDialogIsOpen,
  } = commonStore;
  const { getSelectedUserFiles } = fileStore;
  const [approver, setApprover] = useState<string>("");
  const [approvers, setApprovers] = useState<string[]>([]);
  const [approveBy, setApproveBy] = useState<Dayjs | null>(null);
  const [comment, setComment] = useState<string>("");
  const [approversError, setApproversError] = useState(false);

  const handleSend = async () => {
    const emails = approvers.length > 0 ? approvers : [approver];
    if (!validateEmails(emails)) {
      setApproversError(true);
      toast.error("Invalid input.");
    } else {
      await submitApprovalRequest(
        getSelectedUserFiles(),
        emails.map((a) => a.toLocaleLowerCase().trim()),
        approveBy ? approveBy.toDate() : null,
        comment
      );
      handleClose();
    }
  };

  const handleClose = () => {
    setApprover("");
    setApprovers([]);
    setApproveBy(null);
    setComment("");
    setApprovalRequestSubmitDialogIsOpen(false);
  };

  const handleApproversChange = (
    _event: React.SyntheticEvent<Element, Event>,
    value: (string | never[])[]
  ) => {
    setApproversError(false);
    setApprovers(value as string[]);
  };

  const handleApproverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApproversError(false);
    setApprover(event.target.value);
  };

  return (
    <Dialog open={approvalRequestSubmitDialogIsOpen} onClose={handleClose}>
      <DialogTitle>Submit for approval</DialogTitle>
      <DialogContent dividers>
        <ListUserFiles userFiles={getSelectedUserFiles()} />
        <Autocomplete
          multiple
          id="approvers"
          options={[]}
          defaultValue={[]}
          freeSolo
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Email (press Enter to add multiple)"
              variant="standard"
              margin="normal"
              onChange={handleApproverChange}
              error={approversError}
              helperText={
                approversError && "Specify one ore more valid email addresses"
              }
            />
          )}
          onChange={handleApproversChange}
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
            value={approveBy}
            onChange={(newValue) => setApproveBy(newValue)}
            label="Approve by"
          />
        </LocalizationProvider>
        <TextField
          margin="normal"
          fullWidth
          label="Comment"
          variant="standard"
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" onClick={handleSend}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(DialogApprovalRequestSubmit);
