import { stores } from "@/app/rootStore";
import { browserSupportsPasskeys } from "@/features/identity/api/passkeysApi";
import { AuthForms } from "@/features/identity/components/authFormStyles";
import { Credentials } from "@/features/identity/models/credentials";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Text } from "@/shared/components/text/textStyles";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Routes } from "@/shared/routing/routes";
import { StackSpacing } from "@/shared/theme/tokens";
import { notification } from "@/shared/utils/notifications";
import { validateEmail } from "@/shared/utils/validators";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Divider,
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
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SignInPage = () => {
  usePageTitle("Sign in");
  const [showPassword, setShowPassword] = React.useState(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
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
      setIsLoading(true);
      if (await stores.userAccountStore.signIn(credentials)) {
        if (location.pathname === "/signIn") {
          navigate(Routes.defaultPath);
        }
      }
      setIsLoading(false);
    }
  };

  const handlePasskeySignIn = async () => {
    setIsLoading(true);
    if (await stores.userAccountStore.signInWithPasskey()) {
      navigate(Routes.defaultPath);
    }
    setIsLoading(false);
  };

  return (
    <Container component="main" maxWidth={AuthForms.maxWidth}>
      <Box sx={AuthForms.containerSx}>
        <PageBreadcrumbs items={[{ label: "Sign in" }]} />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={AuthForms.authFormSx}>
          <TextField
            margin="normal"
            variant={AuthForms.inputVariant}
            required
            fullWidth
            id="email"
            label="Email address"
            name="email"
            autoComplete="email"
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
              {passwordError && "Password cannot be empty"}
            </FormHelperText>
          </FormControl>
          <Box sx={AuthForms.authActionsSx}>
            <Stack spacing={StackSpacing.loose}>
              <MainActionButton loading={isLoading} type="submit" fullWidth>
                Sign in
              </MainActionButton>
              <Grid container>
                <Grid item xs={4}>
                  <Link component="button" type="button" variant="body2" onClick={() => navigate("/forgotPassword")}>
                    Forgot password
                  </Link>
                </Grid>
                <Grid item xs={4} sx={Text.alignCenterSx}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => navigate("/resendConfirmationEmail")}
                  >
                    Resend confirmation
                  </Link>
                </Grid>
                <Grid item xs={4} sx={Text.alignRightSx}>
                  <Link component="button" type="button" variant="body2" onClick={() => navigate("/signUp")}>
                    New to us? Sign up
                  </Link>
                </Grid>
              </Grid>
              {browserSupportsPasskeys() && (
                <>
                  <Typography color="text.secondary" component="div" variant="body2">
                    <Divider>OR</Divider>
                  </Typography>
                  <Button disabled={isLoading} fullWidth onClick={handlePasskeySignIn} type="button" variant="outlined">
                    Sign in with a passkey
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default observer(SignInPage);
