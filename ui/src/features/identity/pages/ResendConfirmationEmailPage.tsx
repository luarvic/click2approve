import { stores } from "@/app/rootStore";
import AuthForm from "@/features/identity/components/AuthForm";
import AuthFormActions from "@/features/identity/components/AuthFormActions";
import AuthTextField from "@/features/identity/components/AuthTextField";
import { AuthForms } from "@/features/identity/components/authFormStyles";
import { authPath } from "@/features/identity/routing/returnUrl";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import { validateEmail } from "@/shared/utils/validators";
import { Box, Container, Grid, Link } from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResendConfirmationEmailPage = () => {
  usePageTitle("Resend confirmation email");
  const [emailError, setEmailError] = useState<boolean>(false);
  const { isRunning, run } = useAsyncAction(ActionLoaders.identity.resendConfirmationEmail());
  const returnUrl = useAuthReturnUrl();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    if (!email || !validateEmail(email.toString())) {
      setEmailError(!email || !validateEmail(email.toString()));
      notification.warning("Invalid input.");
    } else {
      await run(async () => {
        if (await stores.userAccountStore.resendConfirmationEmail(email.toString())) {
          navigate(authPath("/confirmationEmailSent", returnUrl));
        }
      });
    }
  };

  return (
    <Container component="main" maxWidth={AuthForms.maxWidth}>
      <Box sx={AuthForms.containerSx}>
        <PageBreadcrumbs items={[{ label: "Email confirmation" }]} />
        <AuthForm onSubmit={handleSubmit} noValidate>
          <AuthTextField
            required
            id="email"
            label="Email address"
            name="email"
            autoComplete="email"
            autoFocus
            error={emailError}
            helperText={emailError && "Invalid email address"}
            onChange={() => setEmailError(false)}
          />
          <AuthFormActions>
            <MainActionButton loading={isRunning} type="submit" fullWidth>
              Send email confirmation link
            </MainActionButton>
            <Grid container>
              <Grid item xs>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate(authPath("/signIn", returnUrl))}
                >
                  Sign in
                </Link>
              </Grid>
              <Grid item>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate(authPath("/signUp", returnUrl))}
                >
                  New to us? Sign up
                </Link>
              </Grid>
            </Grid>
          </AuthFormActions>
        </AuthForm>
      </Box>
    </Container>
  );
};

export default observer(ResendConfirmationEmailPage);
