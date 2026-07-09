import { stores } from "@/app/stores";
import TeamsGrid from "@/features/teams/components/TeamsGrid";
import { TenantType } from "@/features/tenants/models/tenant";
import { Pages } from "@/shared/constants/constants";
import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";

const TeamsPage = () => {
  const currentTenant = stores.tenantStore.currentTenant;
  const canManageTeams =
    stores.productStore.teamApproversAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant?.role !== undefined;

  if (!stores.userAccountStore.currentUser) {
    return <Navigate to="/signIn" />;
  }

  if (!canManageTeams) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Teams
      </Typography>
      <TeamsGrid />
    </>
  );
};

export default observer(TeamsPage);
