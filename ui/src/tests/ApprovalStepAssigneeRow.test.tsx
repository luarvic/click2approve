import ApprovalStepAssigneeRow from "@/features/approvalWorkflow/components/ApprovalStepAssigneeRow";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import { fireEvent, render, screen } from "@testing-library/react";
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

  test("renders employees with matching names without React key warnings", () => {
    const consoleError = vi.spyOn(console, "error");
    try {
      render(
        <ApprovalStepAssigneeRow
          assignee={{ type: AssigneeType.Employee }}
          canUseEmployees
          canUseTeams={false}
          employees={[employee, { ...employee, globalId: "second-employee-id", email: "ada2@example.com" }]}
          onChange={vi.fn()}
          onRemove={vi.fn()}
          teams={[]}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Open" }));
      expect(screen.getAllByRole("option")).toHaveLength(2);
      expect(consoleError.mock.calls.filter((args) => args.some((arg) => String(arg).includes("key")))).toEqual([]);
    } finally {
      consoleError.mockRestore();
    }
  });

  test("retains a disabled assigned employee", () => {
    const disabledEmployee = { ...employee, status: EmployeeStatus.Disabled };
    render(
      <ApprovalStepAssigneeRow
        assignee={{
          employeeGlobalId: disabledEmployee.globalId,
          type: AssigneeType.Employee,
        }}
        canUseEmployees
        canUseTeams={false}
        employees={[disabledEmployee]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
        teams={[]}
      />,
    );

    expect(screen.getByTestId("PersonOffIcon")).toBeTruthy();
  });
});
