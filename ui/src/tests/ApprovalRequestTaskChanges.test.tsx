import { stores } from "@/app/rootStore";
import {
  completeApprovalRequestTask,
  getApprovalRequestTask,
} from "@/features/approvalRequests/api/approvalRequestTasksApi";
import ApprovalRequestTask from "@/features/approvalRequests/components/ApprovalRequestTask";
import { ApprovalRequestTask as Task } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { notification } from "@/shared/utils/notifications";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@/features/approvalRequests/api/approvalRequestTasksApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/approvalRequests/api/approvalRequestTasksApi")>()),
  completeApprovalRequestTask: vi.fn().mockResolvedValue(false),
  getApprovalRequestTask: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/features/approvalRequests/components/ApprovalRequestSignatureField", () => ({
  default: ({ helperText }: { helperText?: string }) => <div>{helperText}</div>,
}));

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
    {
      path: "*",
      element: <ApprovalRequestTask tab="task" taskGlobalId="task-a" onClose={onClose} />,
    },
  ]);
  return render(<RouterProvider router={router} />);
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
      stores.userAccountStore.currentUser = {
        email: "alice@example.com",
        isEmailConfirmed: true,
      };
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

describe("task form validation", () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(() => {
    runInAction(() => {
      stores.tenantStore.currentTenantGlobalId = "tenant-a";
      stores.userAccountStore.currentUser = {
        email: "alice@example.com",
        isEmailConfirmed: true,
      };
      stores.approvalRequestTaskStore.currentTask = {
        ...task,
        isAttachmentRequired: true,
        isCommentRequired: true,
        isElectronicSignatureRequired: true,
      };
    });
  });

  test("shows all applicable errors together when approving", async () => {
    const user = userEvent.setup();
    renderTask();
    await user.click(screen.getByRole("radio", { name: "Approve" }));
    await user.click(screen.getByRole("button", { name: "Complete" }));

    expect(screen.getByText("Comment is required.")).toBeTruthy();
    expect(screen.getByText("Legal name is required.")).toBeTruthy();
    expect(screen.getByText("Signature is required.")).toBeTruthy();
    expect(screen.getByText("At least one attachment is required.")).toBeTruthy();
  });

  test("requires a decision when the API returns null for a pending task", async () => {
    runInAction(() => {
      stores.approvalRequestTaskStore.currentTask = { ...task, result: null } as unknown as Task;
    });
    const user = userEvent.setup();
    renderTask();
    await user.click(screen.getByRole("button", { name: "Complete" }));

    expect(screen.getByText("Choose whether to approve or reject.")).toBeTruthy();
  });

  test("sends a boolean decision after selecting an option", async () => {
    vi.mocked(getApprovalRequestTask).mockResolvedValueOnce(task);
    runInAction(() => {
      stores.approvalRequestTaskStore.currentTask = { ...task, result: null } as unknown as Task;
    });
    const user = userEvent.setup();
    renderTask();
    await user.click(screen.getByRole("radio", { name: "Reject" }));
    await user.type(screen.getByRole("textbox", { name: "Comment" }), "Please revise the figures.");
    await user.click(screen.getByRole("button", { name: "Complete" }));

    await waitFor(() =>
      expect(completeApprovalRequestTask).toHaveBeenCalledWith(
        "tenant-a",
        "task-a",
        false,
        expect.anything(),
        undefined,
        expect.anything(),
      ),
    );
  });

  test("requires a rejection comment without validating hidden approval fields", async () => {
    const user = userEvent.setup();
    renderTask();
    await user.click(screen.getByRole("radio", { name: "Reject" }));
    await user.click(screen.getByRole("button", { name: "Complete" }));

    expect(screen.getByText("Comment is required.")).toBeTruthy();
    expect(screen.queryByText("At least one attachment is required.")).toBeNull();
    expect(screen.queryByText("Signature is required.")).toBeNull();
  });

  test("submits a rejection with a comment even when a stored signature is invalid", async () => {
    const validationWarning = vi.spyOn(notification, "validationWarning");
    runInAction(() => {
      stores.approvalRequestTaskStore.currentTask = { ...task, assigneeSignatureJson: "invalid" };
    });
    const user = userEvent.setup();
    renderTask();
    await user.click(screen.getByRole("radio", { name: "Reject" }));
    await user.type(screen.getByRole("textbox", { name: "Comment" }), "Please revise the figures.");
    await user.click(screen.getByRole("button", { name: "Complete" }));

    expect(validationWarning).not.toHaveBeenCalled();
  });
});
