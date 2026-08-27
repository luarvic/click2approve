import ApprovalStepAssigneeRow from "@/features/approvalWorkflow/components/ApprovalStepAssigneeRow";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const employee: Employee = {
  email: "ada@example.com",
  firstName: "Ada",
  globalId: "employee-id",
  lastName: "Lovelace",
  role: EmployeeRole.User,
  status: EmployeeStatus.Active,
  tenantGlobalId: "tenant-id",
};

describe("<ApprovalStepAssigneeRow />", () => {
  test("greys out employee and team icons when the row is disabled", () => {
    const props = {
      canUseEmployees: true,
      canUseTeams: true,
      disabled: true,
      employees: [employee],
      onChange: vi.fn(),
      onRemove: vi.fn(),
      teams: [{ globalId: "team-id", name: "Finance" }],
    };
    const { rerender } = render(
      <ApprovalStepAssigneeRow
        {...props}
        assignee={{
          employeeGlobalId: employee.globalId,
          type: AssigneeType.Employee,
        }}
      />,
    );

    expect(screen.getByTestId("PersonIcon").className).toContain("MuiSvgIcon-colorDisabled");

    rerender(<ApprovalStepAssigneeRow {...props} assignee={{ teamGlobalId: "team-id", type: AssigneeType.Team }} />);

    expect(screen.getByTestId("GroupsIcon").className).toContain("MuiSvgIcon-colorDisabled");
  });
});
