import { Information } from "@/features/identity/identityMessages";
import { authPath } from "@/features/identity/routing/returnUrl";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import ActionResult from "@/shared/components/layout/ActionResult";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const ConfirmationEmailSentPage = () => {
  usePageTitle(Information.emailVerificationTitle);
  const returnUrl = useAuthReturnUrl();
  return (
    <ActionResult
      title={Information.emailVerificationTitle}
      message={Information.emailVerificationMessage}
      action={
        <Link component={RouterLink} to={authPath("/signIn", returnUrl)}>
          Sign in
        </Link>
      }
    />
  );
};

export default ConfirmationEmailSentPage;
