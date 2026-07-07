import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import TenantUsersGrid from "../../components/grids/TenantUsersGrid";
import { PAGE_TITLE_SX } from "../../data/constants";
import { TenantType, TenantUserRole } from "../../models/tenant";
import { stores } from "../../stores/stores";

const TenantUsersPage = () => {
  const currentTenant = stores.tenantStore.currentTenant;
  const canManageTenantUsers =
    stores.productStore.tenantsAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant?.role === TenantUserRole.Admin;

  if (!stores.userAccountStore.currentUser) {
    return <Navigate to="/signIn" />;
  }

  if (!canManageTenantUsers) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Typography component="h1" variant="h5" sx={PAGE_TITLE_SX}>
        Employees
      </Typography>
      <TenantUsersGrid />
    </>
  );
};

export default observer(TenantUsersPage);
