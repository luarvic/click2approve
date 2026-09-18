import { stores } from "@/app/rootStore";
import {
  authPath,
  getAuthReturnUrl,
  rememberReturnUrl,
  validateReturnUrl,
} from "@/features/identity/routing/returnUrl";
import { notification } from "@/shared/utils/notifications";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

/** Ends sessions that no longer meet the configured email-verification requirement. */
const SessionVerificationGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = stores.userAccountStore.currentUser;
  const needsVerification =
    !!user && !user.isEmailConfirmed && stores.applicationConfigurationStore.requiresConfirmedEmail;

  useEffect(() => {
    if (!needsVerification || !stores.userAccountStore.currentUser) return;
    const destination =
      validateReturnUrl(`${location.pathname}${location.search}${location.hash}`) ?? getAuthReturnUrl(location.search);
    rememberReturnUrl(destination);
    stores.userAccountStore.signOut();
    notification.error(
      "You’ve been signed out because your email address must be verified. Verify your email before signing in again.",
    );
    navigate(authPath("/signIn", destination), { replace: true });
  }, [location.hash, location.pathname, location.search, navigate, needsVerification]);

  return needsVerification ? null : <Outlet />;
};

export default observer(SessionVerificationGuard);
