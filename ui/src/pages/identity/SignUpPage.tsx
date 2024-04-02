import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Credentials } from "../../models/credentials";
import { stores } from "../../stores/Stores";
import {
  DEFAULT_PATH,
  EMAIL_SERVICE_IS_ENABLED,
  PASSWORD_VALIDATOR_ERROR,
} from "../../stores/constantsStore";
import { validateEmail, validatePassword } from "../../utils/validators";

const SignUpPage = () => {
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [passwordConfirmationError, setPasswordConfirmationError] =
    useState<boolean>(false);
  const navigate = useNavigate();

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
      if (!password || !validatePassword(password.toString())) {
        setPasswordConfirmationError(false);
      } else {
        setPasswordConfirmationError(
          password !== null &&
            passwordConfirmation !== null &&
            password.toString() !== passwordConfirmation.toString()
        );
      }
      toast.error("Invalid input.");
    } else {
      const credentials = new Credentials(
        email.toString(),
        password.toString(),
        passwordConfirmation.toString()
      );
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
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1, width: 400 }}
        >
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
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            error={passwordError}
            helperText={passwordError && PASSWORD_VALIDATOR_ERROR}
            onChange={() => {
              setPasswordError(false);
              setPasswordConfirmationError(false);
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="passwordConfirmation"
            label="Password confirmation"
            type="password"
            id="passwordConfirmation"
            error={passwordConfirmationError}
            helperText={
              !passwordError &&
              passwordConfirmationError &&
              "Does not match password"
            }
            onChange={() => {
              setPasswordConfirmationError(false);
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
          >
            Sign up
          </Button>
          <Grid container>
            <Grid item xs></Grid>
            <Grid item>
              <Link href="/signIn" variant="body2">
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
