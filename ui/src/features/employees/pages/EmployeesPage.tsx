import { stores } from "@/app/rootStore";
import EmployeesGrid from "@/features/employees/components/EmployeesGrid";
import { TenantType } from "@/features/tenants/models/tenant";
import { Pages } from "@/shared/constants/constants";
import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate, useLocation } from "react-router-dom";

interface EmployeesLocationState {
  currentEmployeeId?: number;
}

const EmployeesPage = () => {
  const location = useLocation();
  const { currentEmployeeId } = (location.state as EmployeesLocationState | null) ?? {};
  const currentTenant = stores.tenantStore.currentTenant;
  const canManageEmployees =
    stores.productStore.tenantsAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant?.role !== undefined;

  if (!stores.userAccountStore.currentUser) {
    return <Navigate to="/signIn" />;
  }

  if (!canManageEmployees) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Employees
      </Typography>
      <EmployeesGrid currentEmployeeId={currentEmployeeId} />
    </>
  );
};

export default observer(EmployeesPage);
