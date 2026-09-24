import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import { FieldLimits } from "@/shared/config/fieldLimits";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { futureDateRule, textRule } from "@/shared/utils/formValidation";
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
    validation.reset();
    setExpiresAt(null);
    setName("");
    onClose();
  };

  const expirationValue = expiresAt ? (expiresAt.isValid() ? expiresAt.toISOString() : "invalid") : "";
  const validation = useFormValidation(
    { name, expirationValue },
    {
      name: textRule("Name", FieldLimits.name, true),
      expirationValue: futureDateRule(),
    },
    { expirationValue: "ExpiresAt" },
  );

  const handleCreate = async () => {
    if (!validation.validate()) return;
    const created = await validation.run(() => onCreate(name.trim(), expiresAt?.toISOString() ?? null));
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
            {...validation.field("name")}
          />
          <DateTimePicker
            label="Expires at"
            minDateTime={dayjs()}
            slotProps={{ field: { clearable: true }, textField: validation.field("expirationValue") }}
            value={expiresAt}
            onChange={setExpiresAt}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={handleClose} type="button">
          Cancel
        </Button>
        <MainActionButton loading={loading} onClick={() => void handleCreate()} type="button">
          Create token
        </MainActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default NewApiTokenDialog;
