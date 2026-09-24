import { stores } from "@/app/rootStore";
import { manageTwoFactor } from "@/features/identity/api/mfaApi";
import { authenticatorCodePattern, IdentityValidation } from "@/features/identity/config/identityValidation";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import InlineNotice from "@/shared/components/status/InlineNotice";
import CopyableCodeField from "@/shared/components/text/CopyableCodeField";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { FormEvent, useState } from "react";

const savedCodesLabelSx = { mx: 0 };
const savedCodesCheckboxSx = { pl: 0 };
const qrCodeSize = 200;
const qrCodeSx = {
  backgroundColor: "#fff",
  p: 2,
  alignSelf: "center",
  lineHeight: 0,
  maxWidth: "100%",
  boxSizing: "border-box",
  "& svg": { display: "block", maxWidth: "100%", height: "auto" },
};

interface Props {
  mode: "setup" | "disable" | "recovery";
  onClose: () => void;
}

const MfaSettingsDialog = ({ mode, onClose }: Props) => {
  const [sharedKey, setSharedKey] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [savedCodes, setSavedCodes] = useState(false);
  const [sessionChanged, setSessionChanged] = useState(false);
  const action = useAsyncAction(ActionLoaders.identity.saveMfa());
  const issuer = "Click2Approve";
  const email = stores.userAccountStore.currentUser?.email ?? "";
  const authenticatorUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${sharedKey ?? ""}&issuer=${encodeURIComponent(issuer)}&digits=${IdentityValidation.authenticatorCodeLength}&period=${IdentityValidation.authenticatorPeriodSeconds}`;
  const close = () => {
    if (action.isRunning || (recoveryCodes && !savedCodes)) return;
    onClose();
    if (sessionChanged) stores.userAccountStore.signOut();
  };
  const validation = useFormValidation(
    { code },
    {
      code: (value) =>
        sharedKey && !authenticatorCodePattern.test(value.replace(/\s/g, ""))
          ? `Enter the ${IdentityValidation.authenticatorCodeLength}-digit code from your authenticator app.`
          : undefined,
    },
  );
  const submit = async () => {
    if (!validation.validate()) return;
    if (sharedKey && !authenticatorCodePattern.test(code.replace(/\s/g, ""))) {
      notification.warning(
        `Enter the ${IdentityValidation.authenticatorCodeLength}-digit code from your authenticator app.`,
      );
      return;
    }
    await action.run(async () => {
      // Identity rotates the security stamp during setup and enrollment changes.
      // Reauthenticate on exit even if the response is lost after a committed change.
      setSessionChanged(true);
      const result = await manageTwoFactor(
        mode === "disable"
          ? { enable: false, forgetMachine: true }
          : mode === "recovery"
            ? { resetRecoveryCodes: true }
            : sharedKey
              ? { enable: true, twoFactorCode: code.replace(/\s/g, ""), resetRecoveryCodes: true }
              : { resetSharedKey: true, forgetMachine: true },
      );
      if (!result) return;
      if (mode === "setup" && !sharedKey) {
        setSharedKey(result.sharedKey);
        return;
      }
      showPersistenceSuccessNotification(PersistenceSuccessMessages.securitySettingsSaved);
      if (result.recoveryCodes?.length) setRecoveryCodes(result.recoveryCodes);
      else {
        onClose();
        stores.userAccountStore.signOut();
      }
    });
  };
  return (
    <Dialog
      open
      fullWidth
      maxWidth="sm"
      onClose={close}
      aria-labelledby="mfa-settings-title"
      PaperProps={{
        component: "form",
        onSubmit: (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (recoveryCodes) close();
          else void submit();
        },
      }}
    >
      <DialogTitle id="mfa-settings-title">
        {recoveryCodes
          ? "Save your recovery codes"
          : mode === "setup"
            ? "Set up authenticator app"
            : mode === "disable"
              ? "Turn off multi-factor authentication"
              : "Replace recovery codes"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={Forms.formStackSpacing}>
          {recoveryCodes ? (
            <>
              <InlineNotice severity="warning">
                Store these codes somewhere safe. Each code works once if you lose access to your authenticator app.
              </InlineNotice>
              <CopyableCodeField label="Recovery codes" value={recoveryCodes.join("\n")} />
              <FormControlLabel
                label="I have saved my recovery codes"
                sx={savedCodesLabelSx}
                control={
                  <Checkbox
                    sx={savedCodesCheckboxSx}
                    checked={savedCodes}
                    onChange={(_, checked) => setSavedCodes(checked)}
                  />
                }
              />
              <Typography color="text.secondary">
                Sign in again to continue with your updated security settings.
              </Typography>
            </>
          ) : (
            <>
              {sharedKey ? (
                <>
                  <Typography color="text.secondary">
                    Scan this QR code with Microsoft Authenticator, Google Authenticator, or another compatible app.
                  </Typography>
                  <Box sx={qrCodeSx}>
                    <QRCodeSVG value={authenticatorUri} size={qrCodeSize} title="Authenticator setup QR code" />
                  </Box>
                  <Typography color="text.secondary">
                    Can’t scan the QR code? Enter this setup key in your authenticator app.
                  </Typography>
                  <CopyableCodeField label="Setup key" value={sharedKey} />
                  <TextField
                    autoFocus
                    label="Verification code from your authenticator app"
                    value={code}
                    {...validation.field("code")}
                    autoComplete="one-time-code"
                    inputProps={{ inputMode: "numeric", maxLength: IdentityValidation.authenticatorCodeLength }}
                    disabled={action.isRunning}
                    onChange={(event) => setCode(event.target.value)}
                  />
                </>
              ) : (
                <Typography color="text.secondary">
                  {mode === "setup"
                    ? "Connect an authenticator app, verify a code, and save your recovery codes. Once you start setup, you will need to sign in again when you finish or cancel."
                    : mode === "disable"
                      ? "Your password will be sufficient for password sign-in. You will need to sign in again after this change."
                      : "This replaces all previous recovery codes. Save the new codes before signing in again."}
                </Typography>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {recoveryCodes ? (
          <MainActionButton type="submit" disabled={!savedCodes}>
            Done — sign in again
          </MainActionButton>
        ) : (
          <>
            <Button type="button" disabled={action.isRunning} onClick={close}>
              {sessionChanged ? "Cancel and sign in again" : "Cancel"}
            </Button>
            <MainActionButton type="submit" loading={action.isRunning}>
              {sharedKey
                ? "Enable MFA"
                : mode === "setup"
                  ? "Continue"
                  : mode === "disable"
                    ? "Turn off MFA"
                    : "Generate recovery codes"}
            </MainActionButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};
export default MfaSettingsDialog;
