import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import TenantUsersGrid from "../../components/grids/TenantUsersGrid";
import { TenantUserRole } from "../../models/tenant";
import { stores } from "../../stores/stores";

const TenantUsersPage = () => {
  const currentTenant = stores.tenantStore.currentTenant;
  const canManageTenantUsers =
    stores.productStore.tenantsAreEnabled &&
    currentTenant?.role === TenantUserRole.Admin;

  if (!stores.userAccountStore.currentUser) {
    return <Navigate to="/signIn" />;
  }

  if (!canManageTenantUsers) {
    return <Navigate to="/" />;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
        Tenant users
      </Typography>
      <TenantUsersGrid />
    </Box>
  );
};

export default observer(TenantUsersPage);
