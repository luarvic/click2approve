import { loginUser } from "@/features/identity/api/authApi";
import AuthForm from "@/features/identity/components/AuthForm";
import AuthFormActions from "@/features/identity/components/AuthFormActions";
import AuthTextField from "@/features/identity/components/AuthTextField";
import { CredentialsData } from "@/features/identity/models/credentials";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import { Link, Typography } from "@mui/material";
import { useState } from "react";

interface Props {
  credentials: CredentialsData;
  onVerified: () => Promise<void>;
  onBack: () => void;
}

const MfaVerification = ({ credentials, onVerified, onBack }: Props) => {
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);
  const action = useAsyncAction(ActionLoaders.identity.verifyMfa());
  const verify = async () => {
    const normalized = code.replace(/\s/g, "");
    if (recovery ? !normalized : !/^\d{6}$/.test(normalized)) {
      notification.warning(
        recovery ? "Enter a recovery code." : "Enter the six-digit code from your authenticator app.",
      );
      return;
    }
    await action.run(async () => {
      const result = await loginUser(
        credentials,
        recovery ? { twoFactorRecoveryCode: normalized } : { twoFactorCode: normalized },
      );
      if (result === true) await onVerified();
    });
  };
  return (
    <AuthForm
      onSubmit={(event) => {
        event.preventDefault();
        void verify();
      }}
    >
      <Typography color="text.secondary">
        {recovery
          ? "Enter one of your saved recovery codes. Each code can be used once."
          : "Enter the six-digit code from your authenticator app."}
      </Typography>
      <AuthTextField
        autoFocus
        label={recovery ? "Recovery code" : "Verification code"}
        value={code}
        disabled={action.isRunning}
        autoComplete="one-time-code"
        inputProps={{ inputMode: recovery ? "text" : "numeric" }}
        onChange={(event) => setCode(event.target.value)}
      />
      <AuthFormActions>
        <MainActionButton fullWidth type="submit" loading={action.isRunning}>
          Verify code
        </MainActionButton>
        <Link
          component="button"
          type="button"
          disabled={action.isRunning}
          onClick={() => {
            setRecovery(!recovery);
            setCode("");
          }}
        >
          {recovery ? "Use authenticator app" : "Use a recovery code"}
        </Link>
        <Link component="button" type="button" disabled={action.isRunning} onClick={onBack}>
          Back
        </Link>
      </AuthFormActions>
    </AuthForm>
  );
};
export default MfaVerification;
