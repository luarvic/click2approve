import { stores } from "@/app/rootStore";
import DelegationDialog from "@/features/delegations/components/DelegationDialog";
import { ApprovalDelegation } from "@/features/delegations/models/approvalDelegation";
import { Employee, EmployeeStatus } from "@/features/employees/models/employee";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { MemoryRouter } from "react-router-dom";
import { expect, test, vi } from "vitest";

const delegation: ApprovalDelegation = {
  globalId: "delegation-a",
  tenantGlobalId: "tenant-a",
  delegatorEmployeeGlobalId: "employee-a",
  delegateEmployeeGlobalId: "employee-b",
  createdAt: "2026-10-01T12:00:00Z",
};
const employees: Employee[] = [
  { globalId: "employee-a", email: "alex@example.com", firstName: "Alex", status: EmployeeStatus.Active },
  { globalId: "employee-b", email: "blair@example.com", firstName: "Blair", status: EmployeeStatus.Active },
];

test("keeps employee names visible when tenant refresh clears the picker during save", async () => {
  runInAction(() => {
    stores.tenantStore.currentTenantGlobalId = "tenant-a";
  });
  let finishSave!: (value: ApprovalDelegation | null) => void;
  const saveResult = new Promise<ApprovalDelegation | null>((resolve) => {
    finishSave = resolve;
  });
  const onSubmit = vi.fn(() => saveResult);
  const props = {
    canEdit: true,
    delegation,
    onClose: vi.fn(),
    onDelete: vi.fn().mockResolvedValue(true),
    onSubmit,
  };
  const view = render(
    <MemoryRouter>
      <DelegationDialog {...props} employees={employees} />
    </MemoryRouter>,
  );

  await userEvent.setup().click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  view.rerender(
    <MemoryRouter>
      <DelegationDialog {...props} employees={[]} />
    </MemoryRouter>,
  );

  expect(screen.queryByText("Unknown employee")).toBeNull();
  expect(screen.getAllByText("Alex", { exact: false }).length).toBeGreaterThan(0);
  expect(screen.getAllByText("Blair", { exact: false }).length).toBeGreaterThan(0);

  await act(async () => finishSave(null));
});

test("keeps the delegation name visible when tenant refresh clears the picker during delete", async () => {
  runInAction(() => {
    stores.tenantStore.currentTenantGlobalId = "tenant-a";
  });
  let finishDelete!: (deleted: boolean) => void;
  const deleteResult = new Promise<boolean>((resolve) => {
    finishDelete = resolve;
  });
  const onDelete = vi.fn(() => deleteResult);
  const props = {
    canEdit: true,
    delegation,
    onClose: vi.fn(),
    onDelete,
    onSubmit: vi.fn().mockResolvedValue(null),
  };
  const user = userEvent.setup();
  const view = render(
    <MemoryRouter>
      <DelegationDialog {...props} employees={employees} />
    </MemoryRouter>,
  );

  await user.click(screen.getByRole("button", { name: "Delete" }));
  const confirmation = screen.getByRole("dialog", { name: "Delete delegation" });
  await user.click(within(confirmation).getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(onDelete).toHaveBeenCalledOnce());
  view.rerender(
    <MemoryRouter>
      <DelegationDialog {...props} employees={[]} />
    </MemoryRouter>,
  );

  expect(screen.queryAllByText("Unknown employee")).toHaveLength(0);
  expect(within(confirmation).getByText("Alex to Blair", { exact: false })).toBeTruthy();

  await act(async () => finishDelete(false));
});
