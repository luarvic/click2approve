import { stores } from "@/app/rootStore";
import { useAuthReturnUrl } from "@/features/identity/routing/useAuthReturnUrl";
import { observer } from "mobx-react-lite";
import { Navigate, Outlet } from "react-router-dom";

const AnonymousRoute = () => {
  const returnUrl = useAuthReturnUrl();
  return stores.userAccountStore.currentUser ? <Navigate to={returnUrl} replace /> : <Outlet />;
};

export default observer(AnonymousRoute);
