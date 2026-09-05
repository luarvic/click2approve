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
import { useState } from "react";

interface NewPasskeyDialogProps {
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

const NewPasskeyDialog: React.FC<NewPasskeyDialogProps> = ({ loading, open, onClose, onCreate }) => {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    await onCreate(name.trim());
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>New passkey</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={Forms.formStackSpacing}>
          <DialogContentText>Name this passkey so you can recognize it later.</DialogContentText>
          <TextField
            autoFocus
            label="Passkey name"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={onClose} type="button">
          Cancel
        </Button>
        <MainActionButton disabled={!name.trim()} loading={loading} onClick={() => void handleCreate()} type="button">
          Continue
        </MainActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default NewPasskeyDialog;
