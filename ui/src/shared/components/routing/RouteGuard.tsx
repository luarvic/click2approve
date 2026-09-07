import { stores } from "@/app/rootStore";
import { Information } from "@/features/identity/identityMessages";
import { authPath, clearReachedReturnUrl, rememberReturnUrl } from "@/features/identity/routing/returnUrl";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface RouteGuardProps {
  isAllowed?: boolean;
}

const RouteGuard = ({ isAllowed = true }: RouteGuardProps) => {
  const location = useLocation();
  const destination = `${location.pathname}${location.search}${location.hash}`;
  const user = stores.userAccountStore.currentUser;
  const needsConfirmation = stores.applicationConfigurationStore.requiresConfirmedEmail && !user?.isEmailConfirmed;
  useEffect(() => {
    if (user === undefined) return;
    if (!user || needsConfirmation) rememberReturnUrl(destination);
    else clearReachedReturnUrl(destination);
  }, [destination, needsConfirmation, user]);

  if (user === undefined) return null;
  if (!user) {
    return <Navigate to={authPath("/signIn", destination)} replace />;
  }

  if (needsConfirmation) {
    return (
      <Navigate
        to="/information"
        replace
        state={{
          title: Information.emailVerificationTitle,
          message: Information.emailVerificationMessage,
        }}
      />
    );
  }

  return isAllowed ? <Outlet /> : <Navigate to="/" replace />;
};

export default observer(RouteGuard);
