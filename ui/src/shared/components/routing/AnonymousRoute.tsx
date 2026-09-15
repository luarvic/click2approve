import { stores } from "@/app/rootStore";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

const AnonymousRoute = () => {
  const returnUrl = useAuthReturnUrl();
  const user = stores.userAccountStore.currentUser;
  useEffect(() => {
    if (!user) stores.userAccountStore.clearManualSignOut();
  }, [user]);
  return user ? <Navigate to={returnUrl} replace /> : <Outlet />;
};

export default observer(AnonymousRoute);
