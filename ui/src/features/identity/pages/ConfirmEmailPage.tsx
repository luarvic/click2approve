import { confirmUserEmail } from "@/features/identity/api/authApi";
import { Information, Pages } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import InformationPage from "@/shared/pages/InformationPage";
import { Backdrop, CircularProgress, Link } from "@mui/material";
import { observer } from "mobx-react-lite";
import { type ReactNode, useEffect, useState } from "react";
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
                <Link component={RouterLink} to="/signIn">
                  Sign in
                </Link>,
              ),
            );
          } else {
            setMessage(
              renderMessageWithLink(
                Information.emailVerificationFailureMessage,
                <Link component={RouterLink} to="/resendConfirmationEmail">
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
  }, [navigate, searchParams]);

  return (
    <>
      <InformationPage
        title={Information.emailVerificationResultTitle}
        message={message}
      />
      <Backdrop sx={Pages.backdropLoadingSx} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default observer(ConfirmEmailPage);
