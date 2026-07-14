import { stores } from "@/app/rootStore";
import { Information } from "@/shared/constants/constants";
import { observer } from "mobx-react-lite";
import { Navigate, Outlet } from "react-router-dom";

interface RouteGuardProps {
  isAllowed?: boolean;
}

const RouteGuard = ({ isAllowed = true }: RouteGuardProps) => {
  if (!stores.userAccountStore.currentUser) {
    return <Navigate to="/signIn" replace />;
  }

  if (
    stores.productStore.requiresConfirmedEmail &&
    !stores.userAccountStore.currentUser.isEmailConfirmed
  ) {
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
