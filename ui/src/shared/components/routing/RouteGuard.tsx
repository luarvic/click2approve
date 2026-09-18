import { stores } from "@/app/rootStore";
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
  const isManualSignOut = stores.userAccountStore.isManualSignOut;
  useEffect(() => {
    if (user === undefined) return;
    if (!user && !isManualSignOut) rememberReturnUrl(destination);
    else clearReachedReturnUrl(destination);
  }, [destination, isManualSignOut, user]);

  if (user === undefined) return null;
  if (!user) {
    return <Navigate to={isManualSignOut ? "/signIn" : authPath("/signIn", destination)} replace />;
  }

  return isAllowed ? <Outlet /> : <Navigate to="/" replace />;
};

export default observer(RouteGuard);
