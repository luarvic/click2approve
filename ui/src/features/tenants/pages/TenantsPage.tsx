import TenantsGrid from "@/features/tenants/components/TenantsGrid";
import { Pages } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface TenantsLocationState {
  currentTenantId?: number;
}

const TenantsPage = () => {
  usePageTitle("Organizations");
  const location = useLocation();
  const { currentTenantId } = (location.state as TenantsLocationState | null) ?? {};
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
