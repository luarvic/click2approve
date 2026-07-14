import EmployeesGrid from "@/features/employees/components/EmployeesGrid";
import { Pages } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface EmployeesLocationState {
  currentEmployeeId?: number;
}

const EmployeesPage = () => {
  usePageTitle("Employees");
  const location = useLocation();
  const { currentEmployeeId } = (location.state as EmployeesLocationState | null) ?? {};
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
