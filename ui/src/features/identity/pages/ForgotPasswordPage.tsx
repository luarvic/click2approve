import { stores } from "@/app/rootStore";
import { AuthForms } from "@/features/identity/components/authFormStyles";
import { Information } from "@/features/identity/identityMessages";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { StackSpacing } from "@/shared/theme/tokens";
import { notification } from "@/shared/utils/notifications";
import { validateEmail } from "@/shared/utils/validators";
import { Box, Container, Grid, Link, Stack, TextField } from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  usePageTitle("Forgot password");
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
      if (await stores.userAccountStore.sendResetPasswordLink(email.toString())) {
        navigate("/information", {
          state: {
            title: Information.passwordResetTitle,
            message: Information.passwordResetMessage,
          },
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth={AuthForms.maxWidth}>
      <Box sx={AuthForms.containerSx}>
        <PageBreadcrumbs items={[{ label: "Forgot password" }]} />
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
          <Box sx={AuthForms.authActionsSx}>
            <Stack spacing={StackSpacing.loose}>
              <MainActionButton loading={isLoading} type="submit" fullWidth>
                Send password reset link
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
            </Stack>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default observer(ForgotPasswordPage);
