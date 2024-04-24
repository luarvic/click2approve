import { Visibility, VisibilityOff } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
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
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  DEFAULT_PATH,
  EMAIL_SERVICE_IS_ENABLED,
  PASSWORD_VALIDATOR_ERROR,
} from "../../data/constants";
import { Credentials } from "../../models/credentials";
import { stores } from "../../stores/stores";
import { validateEmail, validatePassword } from "../../utils/validators";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    React.useState(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [passwordConfirmationError, setPasswordConfirmationError] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowPasswordConfirmation = () =>
    setShowPasswordConfirmation((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
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
        !password ||
          !passwordConfirmation ||
          password.toString() !== passwordConfirmation.toString()
      );
      toast.error("Invalid input.");
    } else {
      const credentials = new Credentials(
        email.toString(),
        password.toString(),
        passwordConfirmation.toString()
      );
      setIsLoading(true);
      if (await stores.userAccountStore.signUp(credentials)) {
        if (EMAIL_SERVICE_IS_ENABLED) {
          navigate("/information", {
            state: {
              message:
                "A confirmation link was sent to your email. Confirm your email address to continue.",
            },
          });
        } else {
          if (await stores.userAccountStore.signIn(credentials)) {
            navigate(DEFAULT_PATH);
          }
        }
      }
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
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
          <FormControl margin="normal" fullWidth variant="outlined" required>
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
              {passwordError && PASSWORD_VALIDATOR_ERROR}
            </FormHelperText>
          </FormControl>
          <FormControl margin="normal" fullWidth variant="outlined" required>
            <InputLabel error={passwordConfirmationError}>
              Password confirmation
            </InputLabel>
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
                    {showPasswordConfirmation ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              }
              label="Password confirmation"
              onChange={() => setPasswordConfirmationError(false)}
            />
            <FormHelperText error id="passwordConfirmationError">
              {!passwordError &&
                passwordConfirmationError &&
                "Does not match password"}
            </FormHelperText>
          </FormControl>
          <LoadingButton
            loading={isLoading}
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
          >
            Sign up
          </LoadingButton>
          <Grid container>
            <Grid item>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate("/signIn")}
              >
                Already have an account? Sign in
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default observer(SignUpPage);
