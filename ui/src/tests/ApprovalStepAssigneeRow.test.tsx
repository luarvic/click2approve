import { stores } from "@/app/rootStore";
import type { ApplicationConfiguration } from "@/features/applicationConfiguration/models/applicationConfiguration";
import ApprovalStepAssigneeRow from "@/features/approvalWorkflow/components/ApprovalStepAssigneeRow";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { EmployeeRole } from "@/features/tenants/models/tenant";
import { fireEvent, render, screen } from "@testing-library/react";
import { runInAction } from "mobx";
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
  test("shows employee and team names without type icons", () => {
    const props = {
      canUseEmployees: true,
      canUseTeams: true,
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

    expect((screen.getByRole("combobox", { name: "Employee" }) as HTMLInputElement).value).toBe("Ada Lovelace");
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("option", { name: "Ada Lovelace" })).toBeTruthy();
    expect(screen.queryByTestId("PersonOutlinedIcon")).toBeNull();

    rerender(<ApprovalStepAssigneeRow {...props} assignee={{ teamGlobalId: "team-id", type: AssigneeType.Team }} />);

    expect((screen.getByRole("combobox", { name: "Team" }) as HTMLInputElement).value).toBe("Finance");
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("option", { name: "Finance" })).toBeTruthy();
    expect(screen.queryByTestId("GroupsOutlinedIcon")).toBeNull();
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

    expect((screen.getByRole("combobox", { name: "Employee" }) as HTMLInputElement).value).toBe(
      "Ada Lovelace (disabled)",
    );
    expect(screen.queryByTestId("PersonOffOutlinedIcon")).toBeNull();
  });
});

describe("email assignee access choices", () => {
  test("User and Guest map to the boolean flag and switching preserves the email", async () => {
    const original = stores.applicationConfigurationStore.applicationConfiguration;
    const onChange = vi.fn();
    runInAction(() => {
      stores.applicationConfigurationStore.applicationConfiguration = {
        ...original,
        capabilities: { ...original?.capabilities, guestApprovals: true },
      } as ApplicationConfiguration;
    });
    try {
      const props = {
        canUseEmployees: false,
        canUseTeams: false,
        employees: [],
        teams: [],
        onChange,
        onRemove: vi.fn(),
      };
      const assignee = { globalId: "row-id", type: AssigneeType.User, email: "client@example.com" };
      const { rerender } = render(<ApprovalStepAssigneeRow {...props} assignee={assignee} />);
      expect(screen.getByRole("combobox", { name: "Type" }).textContent).toBe("Guest");
      expect(screen.queryByRole("checkbox")).toBeNull();
      fireEvent.mouseDown(screen.getByRole("combobox", { name: "Type" }));
      fireEvent.click(screen.getByRole("option", { name: "User Account required" }));
      expect(onChange).toHaveBeenLastCalledWith({ ...assignee, accountSignInRequired: true });
      rerender(<ApprovalStepAssigneeRow {...props} assignee={{ ...assignee, accountSignInRequired: true }} />);
      fireEvent.mouseDown(screen.getByRole("combobox", { name: "Type" }));
      fireEvent.click(screen.getByRole("option", { name: "Guest No account required" }));
      expect(onChange).toHaveBeenLastCalledWith({ ...assignee, accountSignInRequired: false });
    } finally {
      runInAction(() => {
        stores.applicationConfigurationStore.applicationConfiguration = original;
      });
    }
  });

  test("the open-source UI does not offer Guest", () => {
    render(
      <ApprovalStepAssigneeRow
        assignee={{ type: AssigneeType.User }}
        canUseEmployees={false}
        canUseTeams={false}
        employees={[]}
        teams={[]}
        onChange={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Type" }));
    expect(screen.queryByRole("option", { name: /^Guest/ })).toBeNull();
    expect(screen.getByRole("option", { name: "User Account required" })).toBeTruthy();
  });
});
