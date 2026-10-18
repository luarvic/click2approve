import EmployeesGrid from "@/features/employees/components/EmployeesGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface EmployeesLocationState {
  currentEmployeeGlobalId?: string;
}

const EmployeesPage = () => {
  usePageTitle("Employees");
  const location = useLocation();
  const { currentEmployeeGlobalId } = (location.state as EmployeesLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Employees",
            titleAction: (
              <HelpPopover
                docsHref="/docs/employees/"
                helpText="View organization employees, roles, teams, and access status."
              />
            ),
          },
        ]}
      />
      <EmployeesGrid currentEmployeeGlobalId={currentEmployeeGlobalId} />
    </>
  );
};

export default observer(EmployeesPage);
