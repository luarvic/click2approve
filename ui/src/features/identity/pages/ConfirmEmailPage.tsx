import { confirmUserEmail } from "@/features/identity/api/authApi";
import { Information } from "@/features/identity/identityMessages";
import { authPath } from "@/features/identity/routing/returnUrl";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import { Pages } from "@/shared/components/layout/pageStyles";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import InformationPage from "@/shared/pages/InformationPage";
import { Backdrop, CircularProgress, Link } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState, type ReactNode } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

const renderMessageWithLink = (message: string, link: ReactNode) => {
  const [beforeLink, afterLink] = message.split("{link}");

  return (
    <>
      {beforeLink}
      {link}
      {afterLink}
    </>
  );
};

const ConfirmEmailPage = () => {
  usePageTitle(Information.emailVerificationResultTitle);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnUrl = useAuthReturnUrl();
  const [message, setMessage] = useState<ReactNode>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const code = searchParams.get("code");

    if (userId && code) {
      setIsLoading(true);
      confirmUserEmail(userId, code)
        .then((result) => {
          if (result) {
            setMessage(
              renderMessageWithLink(
                Information.emailVerificationSuccessMessage,
                <Link component={RouterLink} to={authPath("/signIn", returnUrl)}>
                  Sign in
                </Link>,
              ),
            );
          } else {
            setMessage(
              renderMessageWithLink(
                Information.emailVerificationFailureMessage,
                <Link component={RouterLink} to={authPath("/resendConfirmationEmail", returnUrl)}>
                  request a new verification email
                </Link>,
              ),
            );
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      navigate("/notfound");
    }
  }, [navigate, returnUrl, searchParams]);

  return (
    <>
      <InformationPage title={Information.emailVerificationResultTitle} message={message} />
      <Backdrop sx={Pages.backdropLoadingSx} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default observer(ConfirmEmailPage);
