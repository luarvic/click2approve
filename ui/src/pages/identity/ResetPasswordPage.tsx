import {
  Box,
  Button,
  Container,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Credentials } from "../../models/credentials";
import { stores } from "../../stores/Stores";
import {
  DEFAULT_PATH,
  PASSWORD_VALIDATOR_ERROR,
} from "../../stores/constantsStore";
import { validatePassword } from "../../utils/validators";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [passwordConfirmationError, setPasswordConfirmationError] =
    useState<boolean>(false);
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
  }, []);

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
    } else if (
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
    } else {
      navigate("/information", {
        state: { message: "Password reset failed." },
      });
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
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="New password"
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
            label="New password confirmation"
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
            Reset
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

export default ResetPasswordPage;
