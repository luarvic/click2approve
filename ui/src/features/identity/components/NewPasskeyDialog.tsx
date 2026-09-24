import { IdentityValidation } from "@/features/identity/config/identityValidation";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { textRule } from "@/shared/utils/formValidation";
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
  onCreate: (name: string) => Promise<boolean>;
}

const NewPasskeyDialog: React.FC<NewPasskeyDialogProps> = ({ loading, open, onClose, onCreate }) => {
  const [name, setName] = useState("");

  const validation = useFormValidation(
    { name },
    {
      name: textRule("Name", IdentityValidation.passkeyNameLength, true),
    },
  );

  const handleClose = () => {
    validation.reset();
    setName("");
    onClose();
  };

  const handleCreate = async () => {
    if (!validation.validate()) return;
    if (await validation.run(() => onCreate(name.trim()))) handleClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
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
            {...validation.field("name")}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={handleClose} type="button">
          Cancel
        </Button>
        <MainActionButton loading={loading} onClick={() => void handleCreate()} type="button">
          Continue
        </MainActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default NewPasskeyDialog;
