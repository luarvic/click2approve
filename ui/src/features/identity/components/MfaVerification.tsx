import { loginUser } from "@/features/identity/api/authApi";
import AuthForm from "@/features/identity/components/AuthForm";
import AuthFormActions from "@/features/identity/components/AuthFormActions";
import AuthTextField from "@/features/identity/components/AuthTextField";
import AuthTextLink from "@/features/identity/components/AuthTextLink";
import AuthTextLinks from "@/features/identity/components/AuthTextLinks";
import { authenticatorCodePattern, IdentityValidation } from "@/features/identity/config/identityValidation";
import { CredentialsData } from "@/features/identity/models/credentials";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import { Typography } from "@mui/material";
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
  const validation = useFormValidation(
    { code },
    {
      code: (value) => {
        const normalized = value.replace(/\s/g, "");
        return recovery
          ? !normalized || normalized.length > IdentityValidation.recoveryCodeLength
            ? "Enter a recovery code."
            : undefined
          : authenticatorCodePattern.test(normalized)
            ? undefined
            : `Enter the ${IdentityValidation.authenticatorCodeLength}-digit code from your authenticator app.`;
      },
    },
  );
  const verify = async () => {
    if (!validation.validate()) return;
    const normalized = code.replace(/\s/g, "");
    if (recovery ? !normalized : !authenticatorCodePattern.test(normalized)) {
      notification.warning(
        recovery
          ? "Enter a recovery code."
          : `Enter the ${IdentityValidation.authenticatorCodeLength}-digit code from your authenticator app.`,
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
          : `Enter the ${IdentityValidation.authenticatorCodeLength}-digit code from your authenticator app.`}
      </Typography>
      <AuthTextField
        autoFocus
        label={recovery ? "Recovery code" : "Verification code"}
        value={code}
        {...validation.field("code")}
        disabled={action.isRunning}
        autoComplete="one-time-code"
        inputProps={{ inputMode: recovery ? "text" : "numeric" }}
        onChange={(event) => setCode(event.target.value)}
      />
      <AuthFormActions>
        <MainActionButton fullWidth type="submit" loading={action.isRunning}>
          Verify code
        </MainActionButton>
        <AuthTextLinks>
          <AuthTextLink
            component="button"
            type="button"
            disabled={action.isRunning}
            onClick={() => {
              setRecovery(!recovery);
              setCode("");
            }}
          >
            {recovery ? "Use authenticator app" : "Use a recovery code"}
          </AuthTextLink>
          <AuthTextLink component="button" type="button" disabled={action.isRunning} onClick={onBack}>
            Back
          </AuthTextLink>
        </AuthTextLinks>
      </AuthFormActions>
    </AuthForm>
  );
};
export default MfaVerification;
