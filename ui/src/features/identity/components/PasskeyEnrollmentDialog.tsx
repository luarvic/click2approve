import { browserSupportsPasskeys, listPasskeys, registerPasskey } from "@/features/identity/api/passkeysApi";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { dismissPasskeyEnrollmentPrompt, isPasskeyEnrollmentPromptDismissed } from "@/shared/session/session";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
} from "@mui/material";
import { useEffect, useState } from "react";

interface PasskeyEnrollmentDialogProps {
  email: string | undefined;
}

const defaultPasskeyName = "This device";

const PasskeyEnrollmentDialog: React.FC<PasskeyEnrollmentDialogProps> = ({ email }) => {
  const [open, setOpen] = useState(false);
  const [doNotShowAgain, setDoNotShowAgain] = useState(false);
  const addAction = useAsyncAction(ActionLoaders.passkeys.add());

  useEffect(() => {
    let isCurrent = true;

    const checkWhetherToOpen = async () => {
      if (!email || !browserSupportsPasskeys()) {
        setOpen(false);
        return;
      }
      if (isPasskeyEnrollmentPromptDismissed(email)) {
        setOpen(false);
        return;
      }

      const passkeys = await listPasskeys();
      if (isCurrent && passkeys.length === 0) {
        setOpen(true);
      }
    };

    void checkWhetherToOpen();
    return () => {
      isCurrent = false;
    };
  }, [email]);

  const handleClose = () => {
    if (email && doNotShowAgain) {
      dismissPasskeyEnrollmentPrompt(email);
    }
    setOpen(false);
  };

  const handleAdd = async () => {
    await addAction.run(async () => {
      if (await registerPasskey(defaultPasskeyName)) {
        notification.success("Passkey added.");
        handleClose();
      }
    });
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>Add a passkey</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          Sign in faster with your device’s biometric, PIN, or security key. Keep your password for account recovery.
        </DialogContentText>
        <FormControlLabel
          control={
            <Checkbox
              checked={doNotShowAgain}
              name="passkey-enrollment-dismissal"
              onChange={(event) => setDoNotShowAgain(event.target.checked)}
            />
          }
          label="Don't show this again"
        />
      </DialogContent>
      <DialogActions>
        <Button disabled={addAction.isRunning} onClick={handleClose} type="button">
          Not now
        </Button>
        <MainActionButton loading={addAction.isRunning} onClick={() => void handleAdd()} type="button">
          Add passkey
        </MainActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default PasskeyEnrollmentDialog;
