import { stores } from "@/app/rootStore";
import ApprovalRequestTask from "@/features/approvalRequests/components/ApprovalRequestTask";
import { ApprovalRequestTask as Task } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const task: Task = {
  globalId: "task-a",
  title: "Budget",
  action: ApprovalRequestTaskAction.Approve,
  status: ApprovalRequestTaskStatus.Pending,
  createdAt: "2026-09-01T12:00:00Z",
  createdAtDate: new Date("2026-09-01T12:00:00Z"),
  requestedByDisplayName: "Morgan",
  requestedByEmail: "morgan@example.com",
  organizationDisplayName: "Acme",
  revisionNumber: 1,
  approvalRequestGlobalId: "request-a",
  approvalRequestStepGlobalId: "step-a",
  assigneeEmail: "alice@example.com",
  assigneeDisplayName: "Alice",
  requestFiles: [],
};
const renderTask = (onClose = vi.fn()) => {
  const router = createMemoryRouter([
    { path: "*", element: <ApprovalRequestTask tab="task" taskGlobalId="task-a" onClose={onClose} /> },
  ]);
  return render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);
};

describe("unsaved decisions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  beforeEach(() =>
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    ),
  );
  beforeEach(() => {
    sessionStorage.clear();
    runInAction(() => {
      stores.tenantStore.currentTenantGlobalId = "tenant-a";
      stores.userAccountStore.currentUser = { email: "alice@example.com", isEmailConfirmed: true };
      stores.approvalRequestTaskStore.currentTask = task;
    });
  });
  test("keeps a decision when discard is cancelled, and never restores it after leaving", async () => {
    const user = userEvent.setup();
    const confirm = vi.mocked(window.confirm);
    const onClose = vi.fn();
    const view = renderTask(onClose);
    await user.click(screen.getByRole("radio", { name: "Reject" }));
    await user.type(screen.getByRole("textbox", { name: "Comment" }), "Please update the totals.");
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).not.toHaveBeenCalled();
    expect(confirm).toHaveBeenCalledOnce();
    expect((screen.getByRole("textbox", { name: "Comment" }) as HTMLInputElement).value).toBe(
      "Please update the totals.",
    );
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledWith("task-a");
    expect(sessionStorage.length).toBe(0);
    view.unmount();
    renderTask();
    expect((screen.getByRole("textbox", { name: "Comment" }) as HTMLInputElement).value).toBe("");
    expect((screen.getByRole("radio", { name: "Reject" }) as HTMLInputElement).checked).toBe(false);
  });
  test("does not warn for an untouched decision", async () => {
    const confirm = vi.mocked(window.confirm);
    const onClose = vi.fn();
    renderTask(onClose);
    await userEvent.setup().click(screen.getByRole("button", { name: "Cancel" }));
    expect(confirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith("task-a");
  });
});
