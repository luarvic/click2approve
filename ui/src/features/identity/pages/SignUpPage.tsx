import { stores } from "@/app/rootStore";
import AuthForm from "@/features/identity/components/AuthForm";
import AuthFormActions from "@/features/identity/components/AuthFormActions";
import AuthTextLink from "@/features/identity/components/AuthTextLink";
import AuthTextLinks from "@/features/identity/components/AuthTextLinks";
import AuthTextField from "@/features/identity/components/AuthTextField";
import { AuthForms } from "@/features/identity/components/authFormStyles";
import { Credentials } from "@/features/identity/models/credentials";
import { authPath } from "@/features/identity/routing/returnUrl";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import { Validation } from "@/shared/utils/validationRules";
import { validateEmail, validatePassword } from "@/shared/utils/validators";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
  usePageTitle("Sign up");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = React.useState(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [passwordConfirmationError, setPasswordConfirmationError] = useState<boolean>(false);
  const [acknowledgedVersion, setAcknowledgedVersion] = useState<string | null>(null);
  const [legalError, setLegalError] = useState(false);
  const legal = stores.applicationConfigurationStore.registrationLegal;
  const legalVersion = legal ? `${legal.termsVersion}\n${legal.privacyVersion}` : null;
  const legalAcknowledged = legalVersion !== null && acknowledgedVersion === legalVersion;
  const action = useAsyncAction(ActionLoaders.identity.signUp());
  const navigate = useNavigate();
  const returnUrl = useAuthReturnUrl();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowPasswordConfirmation = () => setShowPasswordConfirmation((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");
    const passwordConfirmation = data.get("passwordConfirmation");
    if (
      (legal && !legalAcknowledged) ||
      !email ||
      !validateEmail(email.toString()) ||
      !password ||
      !validatePassword(password.toString()) ||
      !passwordConfirmation ||
      password.toString() !== passwordConfirmation.toString()
    ) {
      setLegalError(Boolean(legal && !legalAcknowledged));
      setEmailError(!email || !validateEmail(email.toString()));
      setPasswordError(!password || !validatePassword(password.toString()));
      setPasswordConfirmationError(
        !password || !passwordConfirmation || password.toString() !== passwordConfirmation.toString(),
      );
      notification.validationWarning();
    } else {
      const credentials = new Credentials(email.toString(), password.toString(), passwordConfirmation.toString());
      await action.run(async () => {
        if (await stores.userAccountStore.signUp(credentials, legal)) {
          if (stores.applicationConfigurationStore.requiresConfirmedEmail) {
            navigate(authPath("/confirmationEmailSent", returnUrl));
          } else {
            if ((await stores.userAccountStore.signIn(credentials)) === true) {
              navigate(returnUrl, { replace: true });
            }
          }
        }
      });
    }
  };

  return (
    <Container component="main" maxWidth={AuthForms.maxWidth}>
      <Box sx={AuthForms.containerSx}>
        <PageBreadcrumbs
          items={[
            {
              label: "Sign up",
              titleAction: (
                <HelpPopover
                  docsHref="/docs/sign-in/"
                  helpText="Create your account and Personal workspace with your email and a password."
                />
              ),
            },
          ]}
        />
        <AuthForm onSubmit={handleSubmit} noValidate>
          <AuthTextField
            required
            id="email"
            label="Email address"
            name="email"
            autoFocus
            error={emailError}
            helperText={emailError && "Invalid email address"}
            onChange={() => setEmailError(false)}
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
              onChange={() => setPasswordError(false)}
            />
            <FormHelperText error id="passwordError">
              {passwordError && Validation.passwordValidatorError}
            </FormHelperText>
          </FormControl>
          <FormControl margin="normal" fullWidth variant={AuthForms.inputVariant} required>
            <InputLabel error={passwordConfirmationError}>Password confirmation</InputLabel>
            <OutlinedInput
              id="passwordConfirmation"
              name="passwordConfirmation"
              type={showPasswordConfirmation ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password confirmation visibility"
                    onClick={handleClickShowPasswordConfirmation}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password confirmation"
              onChange={() => setPasswordConfirmationError(false)}
            />
            <FormHelperText error id="passwordConfirmationError">
              {!passwordError && passwordConfirmationError && "Does not match password"}
            </FormHelperText>
          </FormControl>
          {legal && (
            <FormControl error={legalError} fullWidth margin="normal">
              <FormControlLabel
                required={false}
                sx={AuthForms.acknowledgementSx}
                control={
                  <Checkbox
                    checked={legalAcknowledged}
                    required
                    name="legalAcknowledgement"
                    slotProps={{ input: { "aria-describedby": legalError ? "legalAcknowledgementError" : undefined } }}
                    onChange={(_, checked) => {
                      setAcknowledgedVersion(checked ? legalVersion : null);
                      setLegalError(false);
                    }}
                  />
                }
                label={
                  <>
                    I agree to the{" "}
                    <Link href={legal.termsUrl} target="_blank" rel="noopener noreferrer">
                      Terms
                    </Link>
                    {" and acknowledge the "}
                    <Link href={legal.privacyUrl} target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </Link>
                    .
                  </>
                }
              />
              {legalError && (
                <FormHelperText id="legalAcknowledgementError">
                  Agree to the Terms and acknowledge the Privacy Policy to continue.
                </FormHelperText>
              )}
            </FormControl>
          )}
          <AuthFormActions>
            <MainActionButton
              disabled={Boolean(legal && !legalAcknowledged)}
              loading={action.isRunning}
              type="submit"
              fullWidth
            >
              Sign up
            </MainActionButton>
            <AuthTextLinks>
              <AuthTextLink component="button" type="button" onClick={() => navigate(authPath("/signIn", returnUrl))}>
                Sign in
              </AuthTextLink>
            </AuthTextLinks>
          </AuthFormActions>
        </AuthForm>
      </Box>
    </Container>
  );
};

export default observer(SignUpPage);
