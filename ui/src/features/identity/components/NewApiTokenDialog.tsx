import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";

interface NewApiTokenDialogProps {
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, expiresAt: string | null) => Promise<boolean>;
}

const NewApiTokenDialog: React.FC<NewApiTokenDialogProps> = ({ loading, open, onClose, onCreate }) => {
  const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null);
  const [name, setName] = useState("");

  const handleClose = () => {
    setExpiresAt(null);
    setName("");
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    const created = await onCreate(name.trim(), expiresAt?.toISOString() ?? null);
    if (created) handleClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>New API token</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={Forms.formStackSpacing}>
          <DialogContentText>
            Name this token so you can recognize it later. The token value will be shown only once.
          </DialogContentText>
          <TextField
            autoFocus
            label="Token name"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
          <DateTimePicker
            label="Expires at"
            minDateTime={dayjs()}
            slotProps={{ field: { clearable: true } }}
            value={expiresAt}
            onChange={setExpiresAt}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={handleClose} type="button">
          Cancel
        </Button>
        <MainActionButton disabled={!name.trim()} loading={loading} onClick={() => void handleCreate()} type="button">
          Create token
        </MainActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default NewApiTokenDialog;
