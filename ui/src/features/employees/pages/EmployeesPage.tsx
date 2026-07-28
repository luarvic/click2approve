import EmployeesGrid from "@/features/employees/components/EmployeesGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
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
      <PageBreadcrumbs items={[{ label: "Employees" }]} />
      <EmployeesGrid currentEmployeeId={currentEmployeeId} />
    </>
  );
};

export default observer(EmployeesPage);
