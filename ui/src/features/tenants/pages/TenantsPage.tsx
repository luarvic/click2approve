import { stores } from "@/app/rootStore";
import TenantsGrid from "@/features/tenants/components/TenantsGrid";
import { Pages } from "@/shared/constants/constants";
import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate, useLocation } from "react-router-dom";

interface TenantsLocationState {
  currentTenantId?: number;
}

const TenantsPage = () => {
  const location = useLocation();
  const { currentTenantId } = (location.state as TenantsLocationState | null) ?? {};
  if (!stores.userAccountStore.currentUser) {
    return <Navigate to="/signIn" />;
  }

  if (!stores.productStore.tenantsAreEnabled) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Organizations
      </Typography>
      <TenantsGrid currentTenantId={currentTenantId} />
    </>
  );
};

export default observer(TenantsPage);
