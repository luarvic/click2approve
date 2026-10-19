import { authPath } from "@/features/identity/routing/returnUrl";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import ActionResult from "@/shared/components/layout/ActionResult";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const PasswordResetCompletePage = () => {
  usePageTitle("Password reset");
  const returnUrl = useAuthReturnUrl();
  return (
    <ActionResult
      title="Password reset"
      message={
        <>
          Your password has been reset.{" "}
          <Link component={RouterLink} to={authPath("/signIn", returnUrl)}>
            Sign in
          </Link>{" "}
          to continue.
        </>
      }
    />
  );
};

export default PasswordResetCompletePage;
