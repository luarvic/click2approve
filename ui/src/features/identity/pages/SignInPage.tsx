import { stores } from "@/app/rootStore";
import { browserSupportsPasskeys } from "@/features/identity/api/passkeysApi";
import AuthForm from "@/features/identity/components/AuthForm";
import AuthFormActions from "@/features/identity/components/AuthFormActions";
import AuthTextField from "@/features/identity/components/AuthTextField";
import AuthTextLink from "@/features/identity/components/AuthTextLink";
import AuthTextLinks from "@/features/identity/components/AuthTextLinks";
import MfaVerification from "@/features/identity/components/MfaVerification";
import { AuthForms } from "@/features/identity/components/authFormStyles";
import { Credentials, CredentialsData } from "@/features/identity/models/credentials";
import { authPath } from "@/features/identity/routing/returnUrl";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import InlineNotice from "@/shared/components/status/InlineNotice";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import { validateEmail } from "@/shared/utils/validators";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SignInPage = () => {
  usePageTitle("Sign in");
  const [showPassword, setShowPassword] = React.useState(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [emailAwaitingConfirmation, setEmailAwaitingConfirmation] = useState<string | null>(null);
  const [pendingCredentials, setPendingCredentials] = useState<CredentialsData | null>(null);
  const signInAction = useAsyncAction(ActionLoaders.identity.signIn());
  const resendAction = useAsyncAction(ActionLoaders.identity.resendConfirmationEmail());
  const passkeyAction = useAsyncAction(ActionLoaders.identity.passkeySignIn());
  const isLoading = signInAction.isRunning;
  const isPasskeyLoading = passkeyAction.isRunning;
  const navigate = useNavigate();
  const returnUrl = useAuthReturnUrl();
  const location = useLocation();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");
    if (!email || !validateEmail(email.toString()) || !password) {
      setEmailError(!email || !validateEmail(email.toString()));
      setPasswordError(!password);
      notification.warning("Invalid input.");
    } else {
      const credentials = new Credentials(email.toString(), password.toString());
      await signInAction.run(async () => {
        const result = await stores.userAccountStore.signIn(credentials);
        if (typeof result === "object" && "requiresEmailConfirmation" in result)
          setEmailAwaitingConfirmation(credentials.email);
        else if (typeof result === "object") setPendingCredentials(credentials);
        else if (result && location.pathname === "/signIn") navigate(returnUrl, { replace: true });
      });
    }
  };

  const handleResendConfirmation = async () => {
    if (!emailAwaitingConfirmation) return;
    await resendAction.run(async () => {
      if (await stores.userAccountStore.resendConfirmationEmail(emailAwaitingConfirmation))
        navigate(authPath("/confirmationEmailSent", returnUrl));
    });
  };

  const handlePasskeySignIn = async () => {
    await passkeyAction.run(async () => {
      if (await stores.userAccountStore.signInWithPasskey()) navigate(returnUrl, { replace: true });
    });
  };

  return (
    <Container component="main" maxWidth={AuthForms.maxWidth}>
      <Box sx={AuthForms.containerSx}>
        <PageBreadcrumbs items={[{ label: "Sign in" }]} />
        {pendingCredentials ? (
          <MfaVerification
            credentials={pendingCredentials}
            onBack={() => setPendingCredentials(null)}
            onVerified={async () => {
              setPendingCredentials(null);
              if (await stores.userAccountStore.signInWithCachedToken({ promptForPasskey: true }))
                navigate(returnUrl, { replace: true });
            }}
          />
        ) : (
          <AuthForm onSubmit={handleSubmit} noValidate>
            <AuthTextField
              required
              id="email"
              label="Email address"
              name="email"
              autoComplete="email"
              autoFocus
              error={emailError}
              helperText={emailError && "Invalid email address"}
              onChange={() => {
                setEmailError(false);
                setEmailAwaitingConfirmation(null);
              }}
            />
            <FormControl margin="normal" fullWidth variant={AuthForms.inputVariant} required>
              <InputLabel error={passwordError}>Password</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                onChange={() => {
                  setPasswordError(false);
                  setEmailAwaitingConfirmation(null);
                }}
              />
              <FormHelperText error id="passwordError">
                {passwordError && "Password cannot be empty"}
              </FormHelperText>
            </FormControl>
            {emailAwaitingConfirmation && (
              <InlineNotice
                severity="info"
                action={
                  <AuthTextLink
                    component="button"
                    disabled={resendAction.isRunning}
                    type="button"
                    onClick={() => void handleResendConfirmation()}
                  >
                    Resend verification email
                  </AuthTextLink>
                }
              >
                Confirm your email before signing in.
              </InlineNotice>
            )}
            <AuthFormActions>
              <MainActionButton disabled={isPasskeyLoading} loading={isLoading} type="submit" fullWidth>
                Sign in
              </MainActionButton>
              <AuthTextLinks>
                <AuthTextLink component="button" type="button" onClick={() => navigate(authPath("/signUp", returnUrl))}>
                  Sign up
                </AuthTextLink>
                <AuthTextLink
                  component="button"
                  type="button"
                  onClick={() => navigate(authPath("/forgotPassword", returnUrl))}
                >
                  Forgot password
                </AuthTextLink>
              </AuthTextLinks>
              {browserSupportsPasskeys() && (
                <>
                  <Typography component="div" variant="body2" color="text.secondary">
                    <Divider>OR</Divider>
                  </Typography>
                  <Button
                    disabled={isLoading}
                    fullWidth
                    loading={isPasskeyLoading}
                    onClick={handlePasskeySignIn}
                    type="button"
                    variant="outlined"
                  >
                    Sign in with a passkey
                  </Button>
                </>
              )}
            </AuthFormActions>
          </AuthForm>
        )}
      </Box>
    </Container>
  );
};

export default observer(SignInPage);
