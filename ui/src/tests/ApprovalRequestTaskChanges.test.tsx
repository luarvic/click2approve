import { stores } from "@/app/rootStore";
import {
  completeApprovalRequestTask,
  getApprovalRequestTask,
} from "@/features/approvalRequests/api/approvalRequestTasksApi";
import ApprovalRequestTask from "@/features/approvalRequests/components/ApprovalRequestTask";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTask as Task } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { notification } from "@/shared/utils/notifications";
import { render, screen, waitFor, within } from "@testing-library/react";
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
  return { ...render(<RouterProvider router={router} />), router };
};

describe("task response state", () => {
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
  test.each([AssigneeType.Team, AssigneeType.Employee, AssigneeType.User])(
    "shows the individual recipient icon for a %s workflow assignment",
    (assigneeType) => {
      const isAssigneeEmployee = assigneeType !== AssigneeType.User;
      runInAction(() => {
        stores.approvalRequestTaskStore.currentTask = {
          ...task,
          isAssigneeEmployee,
          approvalRequestStepAssigneeGlobalId: "assignee-a",
          approvalRequest: {
            globalId: "request-a",
            title: "Budget",
            status: ApprovalRequestStatus.Started,
            createdAt: task.createdAt,
            createdAtDate: task.createdAtDate,
            revisionNumber: 1,
            requestFiles: [],
            requesterUserGlobalId: "requester-a",
            submittedByUserGlobalId: "requester-a",
            requesterDisplayName: "Morgan",
            requesterEmail: "morgan@example.com",
            submittedByDisplayName: "Morgan",
            submittedByEmail: "morgan@example.com",
            organizationDisplayName: "Acme",
            steps: [
              {
                globalId: "step-a",
                sequence: 1,
                action: ApprovalRequestTaskAction.Approve,
                assignees: [{ globalId: "assignee-a", type: assigneeType, displayName: "Finance" }],
              },
            ],
          },
        };
      });
      renderTask();

      const assignee = screen.getByText(isAssigneeEmployee ? "Alice" : "alice@example.com").parentElement!;
      expect(
        within(assignee).getByTestId(isAssigneeEmployee ? "PersonOutlinedIcon" : "EmailOutlinedIcon"),
      ).toBeTruthy();
      expect(within(assignee).queryByTestId("GroupsOutlinedIcon")).toBeNull();
      if (assigneeType === AssigneeType.Team) {
        expect(screen.getByText("Assigned via")).toBeTruthy();
        expect(screen.getByText("Finance")).toBeTruthy();
      } else {
        expect(screen.queryByText("Assigned via")).toBeNull();
      }
    },
  );
  test.each(["Cancel", "Escape"])("%s leaves an edited decision immediately without restoring it", async (action) => {
    const user = userEvent.setup();
    const confirm = vi.mocked(window.confirm);
    const onClose = vi.fn();
    const view = renderTask(onClose);
    await user.click(screen.getByRole("radio", { name: "Reject" }));
    await user.type(screen.getByRole("textbox", { name: "Comment" }), "Please update the totals.");
    if (action === "Escape") {
      await user.keyboard("{Escape}");
    } else {
      await user.click(screen.getByRole("button", { name: "Cancel" }));
    }
    expect(confirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith("task-a");
    expect(sessionStorage.length).toBe(0);
    view.unmount();
    renderTask();
    expect((screen.getByRole("textbox", { name: "Comment" }) as HTMLInputElement).value).toBe("");
    expect((screen.getByRole("radio", { name: "Reject" }) as HTMLInputElement).checked).toBe(false);
  });
  test("allows tab navigation and browser unload with an edited decision", async () => {
    const user = userEvent.setup();
    const { router } = renderTask();
    await user.click(screen.getByRole("radio", { name: "Reject" }));
    await user.type(screen.getByRole("textbox", { name: "Comment" }), "Please revise.");
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(false);
    await user.click(screen.getByRole("tab", { name: "Workflow" }));
    expect(router.state.location.pathname).toContain("/tasks/task-a/workflow");
    expect(window.confirm).not.toHaveBeenCalled();
  });

  test("does not warn for an untouched decision", async () => {
    const confirm = vi.mocked(window.confirm);
    const onClose = vi.fn();
    renderTask(onClose);
    await userEvent.setup().click(screen.getByRole("button", { name: "Cancel" }));
    expect(confirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledWith("task-a");
  });

  test("keeps draft values when the same task is refreshed", async () => {
    const user = userEvent.setup();
    renderTask();
    await user.click(screen.getByRole("radio", { name: "Reject" }));
    await user.type(screen.getByRole("textbox", { name: "Comment" }), "Please update the totals.");

    runInAction(() => {
      stores.approvalRequestTaskStore.currentTask = { ...task, comment: "Older saved comment" };
    });

    expect((screen.getByRole("radio", { name: "Reject" }) as HTMLInputElement).checked).toBe(true);
    expect((screen.getByRole("textbox", { name: "Comment" }) as HTMLInputElement).value).toBe(
      "Please update the totals.",
    );
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
