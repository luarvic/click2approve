import { confirmUserEmail } from "@/features/identity/api/authApi";
import { Information } from "@/features/identity/identityMessages";
import { authPath } from "@/features/identity/routing/returnUrl";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import ActionResult from "@/shared/components/layout/ActionResult";
import { Pages } from "@/shared/components/layout/pageStyles";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Backdrop, CircularProgress } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ConfirmEmailPage = () => {
  usePageTitle(Information.emailVerificationResultTitle);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnUrl = useAuthReturnUrl();
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    const code = searchParams.get("code");

    if (userId && code) {
      setIsLoading(true);
      confirmUserEmail(userId, code)
        .then((result) => {
          setIsConfirmed(result);
        })
        .finally(() => setIsLoading(false));
    } else {
      navigate("/notfound");
    }
  }, [navigate, returnUrl, searchParams]);

  return (
    <>
      <ActionResult
        title={Information.emailVerificationResultTitle}
        message={
          isConfirmed === null
            ? ""
            : isConfirmed
              ? Information.emailVerificationSuccessMessage
              : Information.emailVerificationFailureMessage
        }
        action={
          isConfirmed !== null && (
            <MainActionButton
              onClick={() => navigate(authPath(isConfirmed ? "/signIn" : "/resendConfirmationEmail", returnUrl))}
            >
              {isConfirmed ? "Sign in" : "Request a new verification email"}
            </MainActionButton>
          )
        }
      />
      <Backdrop sx={Pages.backdropLoadingSx} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default observer(ConfirmEmailPage);
