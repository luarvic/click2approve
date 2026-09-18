import { stores } from "@/app/rootStore";
import AuthForm from "@/features/identity/components/AuthForm";
import AuthFormActions from "@/features/identity/components/AuthFormActions";
import AuthTextLink from "@/features/identity/components/AuthTextLink";
import AuthTextLinks from "@/features/identity/components/AuthTextLinks";
import AuthTextField from "@/features/identity/components/AuthTextField";
import { AuthForms } from "@/features/identity/components/authFormStyles";
import { authPath } from "@/features/identity/routing/returnUrl";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { notification } from "@/shared/utils/notifications";
import { validateEmail } from "@/shared/utils/validators";
import { Box, Container } from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPasswordPage = () => {
  usePageTitle("Forgot password");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const returnUrl = useAuthReturnUrl();

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
        navigate(authPath("/passwordResetEmailSent", returnUrl));
      }
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth={AuthForms.maxWidth}>
      <Box sx={AuthForms.containerSx}>
        <PageBreadcrumbs items={[{ label: "Forgot password" }]} />
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
            <MainActionButton loading={isLoading} type="submit" fullWidth>
              Send password reset link
            </MainActionButton>
            <AuthTextLinks>
              <AuthTextLink component="button" type="button" onClick={() => navigate(authPath("/signIn", returnUrl))}>
                Sign in
              </AuthTextLink>
              <AuthTextLink component="button" type="button" onClick={() => navigate(authPath("/signUp", returnUrl))}>
                Sign up
              </AuthTextLink>
            </AuthTextLinks>
          </AuthFormActions>
        </AuthForm>
      </Box>
    </Container>
  );
};

export default observer(ForgotPasswordPage);
