import { Employee } from "@/features/employees/models/employee";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";

interface EmployeeDisplayNameProps {
  employee: Employee;
  oneLine?: boolean;
}

const EmployeeDisplayName: React.FC<EmployeeDisplayNameProps> = ({ employee, oneLine = false }) => (
  <ApprovalRequestParticipantLine
    displayName={employee.displayName}
    email={employee.email}
    employeeStatus={employee.status}
    type={AssigneeType.Employee}
    variant={oneLine ? "body2" : "body1"}
  />
);

export default EmployeeDisplayName;
