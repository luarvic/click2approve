import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
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
import { stores } from "../../stores/stores";
import { validateEmail } from "../../utils/validators";

const ResendConfirmationEmailPage = () => {
  const [emailError, setEmailError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    if (!email || !validateEmail(email.toString())) {
      setEmailError(!email || !validateEmail(email.toString()));
      toast.error("Invalid input.");
    } else {
      setIsLoading(true);
      if (
        await stores.userAccountStore.resendConfirmationEmail(email.toString())
      ) {
        navigate("/information", {
          state: {
            message:
              "A confirmation link was sent to your email. Confirm your email address to continue.",
          },
        });
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
          Email confirmation
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
        >
          <TextField
            margin="normal"
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
          <LoadingButton
            loading={isLoading}
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
          >
            Send email confirmation link
          </LoadingButton>
          <Grid container>
            <Grid item xs>
              <Link href="/signIn" variant="body2">
                Sign in
              </Link>
            </Grid>
            <Grid item>
              <Link href="/signUp" variant="body2">
                New to us? Sign up
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default observer(ResendConfirmationEmailPage);
