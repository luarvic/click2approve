import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
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
import { stores } from "../../stores/Stores";
import { validateEmail } from "../../utils/validators";

const ForgotPasswordPage = () => {
  const [emailError, setEmailError] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    if (!email || !validateEmail(email.toString())) {
      setEmailError(!email || !validateEmail(email.toString()));
      toast.error("Invalid input.");
    } else if (
      await stores.userAccountStore.sendResetPasswordLink(email.toString())
    ) {
      navigate("/information", {
        state: { message: "A reset password link was sent to your email." },
      });
    } else {
      navigate("/information", {
        state: { message: "Unable to send a reset password link." },
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
          Forgot password
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
            autoComplete="email"
            autoFocus
            error={emailError}
            helperText={emailError && "Invalid email address"}
            onChange={() => setEmailError(false)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
          >
            Send password reset link
          </Button>
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
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={stores.commonStore.isLoading("common")}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default observer(ForgotPasswordPage);
