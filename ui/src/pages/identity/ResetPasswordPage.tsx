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
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Credentials } from "../../models/credentials";
import { DEFAULT_PATH, PASSWORD_VALIDATOR_ERROR } from "../../utils/constants";
import { stores } from "../../stores/stores";
import { validatePassword } from "../../utils/validators";

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    React.useState(false);
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [passwordConfirmationError, setPasswordConfirmationError] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const codeParam = searchParams.get("code");

    if (emailParam && codeParam) {
      setEmail(emailParam);
      setCode(codeParam);
    } else {
      navigate("/notfound");
    }
  }, [navigate, searchParams]);

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
    const password = data.get("password");
    const passwordConfirmation = data.get("passwordConfirmation");
    if (
      !password ||
      !validatePassword(password.toString()) ||
      !passwordConfirmation ||
      password.toString() !== passwordConfirmation.toString()
    ) {
      setPasswordError(!password || !validatePassword(password.toString()));
      setPasswordConfirmationError(
        !password ||
          !passwordConfirmation ||
          password.toString() !== passwordConfirmation.toString()
      );
      toast.error("Invalid input.");
    } else {
      setIsLoading(true);
      if (
        await stores.userAccountStore.resetPassword(
          email,
          code,
          password.toString()
        )
      ) {
        const credentials = new Credentials(email, password.toString());
        if (await stores.userAccountStore.signIn(credentials)) {
          navigate(DEFAULT_PATH);
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
          Reset password
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
            Reset
          </LoadingButton>
          <Grid container>
            <Grid item xs>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/signIn")}
              >
                Sign in
              </Link>
            </Grid>
            <Grid item>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/signUp")}
              >
                New to us? Sign up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default observer(ResetPasswordPage);
