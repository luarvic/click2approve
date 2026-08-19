import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { Employee } from "@/features/employees/models/employee";

interface EmployeeDisplayNameProps {
  disabled?: boolean;
  employee: Employee;
  oneLine?: boolean;
}

const EmployeeDisplayName: React.FC<EmployeeDisplayNameProps> = ({ disabled = false, employee, oneLine = false }) => (
  <ApprovalRequestParticipantLine
    disabled={disabled}
    displayName={employee.displayName}
    email={employee.email}
    employeeStatus={employee.status}
    type={AssigneeType.Employee}
    variant={oneLine ? "body2" : "body1"}
  />
);

export default EmployeeDisplayName;
