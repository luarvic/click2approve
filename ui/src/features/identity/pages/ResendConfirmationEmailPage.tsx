import { stores } from "@/app/rootStore";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { AuthForms, Information } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { validateEmail } from "@/shared/utils/validators";
import { Box, Container, Grid, Link, TextField } from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "@/shared/utils/notifications";

const ResendConfirmationEmailPage = () => {
  usePageTitle("Resend confirmation email");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    if (!email || !validateEmail(email.toString())) {
      setEmailError(!email || !validateEmail(email.toString()));
      notification.warning("Invalid input.");
    } else {
      setIsLoading(true);
      if (await stores.userAccountStore.resendConfirmationEmail(email.toString())) {
        navigate("/information", {
          state: {
            title: Information.emailVerificationTitle,
            message: Information.emailVerificationMessage,
          },
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth={AuthForms.maxWidth}>
      <Box sx={AuthForms.containerSx}>
        <PageBreadcrumbs items={[{ label: "Email confirmation" }]} />
        <Box component="form" onSubmit={handleSubmit} noValidate>
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
          <MainActionButton loading={isLoading} type="submit" fullWidth sx={AuthForms.submitButtonSx}>
            Send email confirmation link
          </MainActionButton>
          <Grid container>
            <Grid item xs>
              <Link component="button" type="button" variant="body2" onClick={() => navigate("/signIn")}>
                Sign in
              </Link>
            </Grid>
            <Grid item>
              <Link component="button" type="button" variant="body2" onClick={() => navigate("/signUp")}>
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
