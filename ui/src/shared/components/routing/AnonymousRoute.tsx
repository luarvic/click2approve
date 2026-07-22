import { stores } from "@/app/rootStore";
import { Routes } from "@/shared/constants/constants";
import { observer } from "mobx-react-lite";
import { Navigate, Outlet } from "react-router-dom";

const AnonymousRoute = () => {
  return stores.userAccountStore.currentUser ? (
    <Navigate to={Routes.defaultPath} replace />
  ) : (
    <Outlet />
  );
};

export default observer(AnonymousRoute);
