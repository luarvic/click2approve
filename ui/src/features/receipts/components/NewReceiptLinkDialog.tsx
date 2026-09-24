import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import { notification } from "@/shared/utils/notifications";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";

interface NewReceiptLinkDialogProps {
  loading: boolean;
  onClose: () => void;
  onCreate: (expiresAt: Date) => Promise<boolean>;
}

const defaultLifetimeDays = 30;
const NewReceiptLinkDialog = ({ loading, onClose, onCreate }: NewReceiptLinkDialogProps) => {
  const [expiration, setExpiration] = useState<Dayjs | null>(() => dayjs().add(defaultLifetimeDays, "day"));
  const [error, setError] = useState(false);
  const handleCreate = async () => {
    if (!expiration?.isValid() || expiration.endOf("day").valueOf() <= Date.now()) {
      setError(true);
      notification.warning("Choose a valid expiration date.");
      return;
    }
    if (await onCreate(expiration.endOf("day").toDate())) onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open onClose={loading ? undefined : onClose}>
      <DialogTitle>New receipt link</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={Forms.formStackSpacing}>
          <DialogContentText>
            Anyone with this link can view the receipt until it expires or you remove it.
          </DialogContentText>
          <DatePicker
            autoFocus
            disabled={loading}
            disablePast
            label="Expires"
            onChange={(value) => {
              setExpiration(value);
              setError(false);
            }}
            slotProps={{
              field: { clearable: true },
              textField: {
                fullWidth: true,
                required: true,
                size: "small",
                variant: "outlined",
                error,
                helperText: error
                  ? "Choose today or a future date."
                  : "Valid through this date in your local timezone.",
              },
            }}
            value={expiration}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={onClose}>
          Cancel
        </Button>
        <MainActionButton loading={loading} onClick={() => void handleCreate()}>
          Create link
        </MainActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default NewReceiptLinkDialog;
