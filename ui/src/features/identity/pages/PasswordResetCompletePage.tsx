import { authPath } from "@/features/identity/routing/returnUrl";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import ActionResult from "@/shared/components/layout/ActionResult";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

const PasswordResetCompletePage = () => {
  usePageTitle("Password reset");
  const returnUrl = useAuthReturnUrl();
  const navigate = useNavigate();
  return (
    <ActionResult
      title="Password reset"
      message="Your password has been reset. Sign in to continue."
      action={<MainActionButton onClick={() => navigate(authPath("/signIn", returnUrl))}>Sign in</MainActionButton>}
    />
  );
};

export default PasswordResetCompletePage;
