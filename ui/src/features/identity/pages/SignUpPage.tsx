import { stores } from "@/app/rootStore";
import { AuthForms } from "@/features/identity/components/authFormStyles";
import { Information } from "@/features/identity/identityMessages";
import { Credentials } from "@/features/identity/models/credentials";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Routes } from "@/shared/routing/routes";
import { StackSpacing } from "@/shared/theme/tokens";
import { notification } from "@/shared/utils/notifications";
import { Validation } from "@/shared/utils/validationRules";
import { validateEmail, validatePassword } from "@/shared/utils/validators";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Stack,
  TextField,
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

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
      !email ||
      !validateEmail(email.toString()) ||
      !password ||
      !validatePassword(password.toString()) ||
      !passwordConfirmation ||
      password.toString() !== passwordConfirmation.toString()
    ) {
      setEmailError(!email || !validateEmail(email.toString()));
      setPasswordError(!password || !validatePassword(password.toString()));
      setPasswordConfirmationError(
        !password || !passwordConfirmation || password.toString() !== passwordConfirmation.toString(),
      );
      notification.warning("Invalid input.");
    } else {
      const credentials = new Credentials(email.toString(), password.toString(), passwordConfirmation.toString());
      setIsLoading(true);
      if (await stores.userAccountStore.signUp(credentials)) {
        if (stores.applicationConfigurationStore.requiresConfirmedEmail) {
          navigate("/information", {
            state: {
              title: Information.emailVerificationTitle,
              message: Information.emailVerificationMessage,
            },
          });
        } else {
          if (await stores.userAccountStore.signIn(credentials)) {
            navigate(Routes.defaultPath);
          }
        }
      }
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth={AuthForms.maxWidth}>
      <Box sx={AuthForms.containerSx}>
        <PageBreadcrumbs items={[{ label: "Sign up" }]} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={AuthForms.authFormSx}>
          <TextField
            margin="normal"
            variant={AuthForms.inputVariant}
            required
            fullWidth
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
          <Box sx={AuthForms.authActionsSx}>
            <Stack spacing={StackSpacing.loose}>
              <MainActionButton loading={isLoading} type="submit" fullWidth>
                Sign up
              </MainActionButton>
              <Grid container>
                <Grid item>
                  <Link component="button" type="button" variant="body2" onClick={() => navigate("/signIn")}>
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default observer(SignUpPage);
