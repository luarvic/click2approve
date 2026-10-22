import { Information } from "@/features/identity/identityMessages";
import { authPath } from "@/features/identity/routing/returnUrl";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import ActionResult from "@/shared/components/layout/ActionResult";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useNavigate } from "react-router-dom";

const PasswordResetEmailSentPage = () => {
  usePageTitle(Information.passwordResetTitle);
  const returnUrl = useAuthReturnUrl();
  const navigate = useNavigate();
  return (
    <ActionResult
      title={Information.passwordResetTitle}
      message={Information.passwordResetMessage}
      action={<MainActionButton onClick={() => navigate(authPath("/signIn", returnUrl))}>Sign in</MainActionButton>}
    />
  );
};

export default PasswordResetEmailSentPage;
