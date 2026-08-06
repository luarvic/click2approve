import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const createdAt = "2026-07-29T12:00:00Z";
const createdAtDate = new Date(createdAt);

const approvalRequest: ApprovalRequest = {
  createdAt,
  createdAtDate,
  createdByDisplayName: "Requester",
  createdByEmail: "requester@example.com",
  organizationDisplayName: "Personal",
  createdByUserId: "requester-user-id",
  description: "Request description",
  globalId: "request-id",
  requestFiles: [],
  revisionNumber: 1,
  status: ApprovalRequestStatus.Pending,
  steps: [
    {
      action: ApprovalRequestTaskAction.Approve,
      assignees: [
        {
          displayName: "Visible Assignee",
          email: "visible@example.com",
          globalId: "visible-assignee-id",
          type: AssigneeType.Email,
        },
      ],
      globalId: "visible-step-id",
      sequence: 1,
      visibility: [
        {
          assigneeDisplayName: "Blocked Assignee",
          assigneeGlobalId: "blocked-assignee-id",
          assigneeType: AssigneeType.Email,
          isVisible: false,
        },
      ],
    },
    {
      action: ApprovalRequestTaskAction.Approve,
      assignees: [
        {
          displayName: "Hidden Assignee",
          email: "hidden@example.com",
          globalId: "hidden-assignee-id",
          type: AssigneeType.Email,
        },
      ],
      globalId: "hidden-step-id",
      isVisible: false,
      sequence: 2,
      tasks: [
        {
          action: ApprovalRequestTaskAction.Approve,
          approvalRequestGlobalId: "request-id",
          approvalRequestStepAssigneeGlobalId: "hidden-assignee-id",
          approvalRequestStepGlobalId: "hidden-step-id",
          assigneeDisplayName: "Hidden Assignee",
          assigneeEmail: "hidden@example.com",
          comment: "Hidden task comment",
          createdAt,
          createdAtDate,
          globalId: "hidden-task-id",
          requestFiles: [],
          organizationDisplayName: "Personal",
          requestedByEmail: "requester@example.com",
          requestedByDisplayName: "Requester",
          revisionNumber: 1,
          status: ApprovalRequestTaskStatus.Pending,
          title: "Hidden task",
        },
      ],
      visibility: [
        {
          assigneeDisplayName: "Current Assignee",
          assigneeGlobalId: "visible-assignee-id",
          assigneeType: AssigneeType.Email,
          isVisible: false,
        },
      ],
    },
  ],
  title: "Request title",
};

describe("<ApprovalSteps />", () => {
  test("shows hidden assignees with the step title without leaking hidden details", () => {
    render(<ApprovalSteps approvalRequest={approvalRequest} />);

    expect(screen.getByText("Step 1")).toBeTruthy();
    expect(screen.getByLabelText("Step 1 action Approve")).toBeTruthy();
    expect(screen.getByLabelText("Step 1 completion rule Any assignee")).toBeTruthy();
    expect(screen.getByLabelText("Step 1 visibility Hidden from Blocked Assignee")).toBeTruthy();
    expect(screen.getByText("visible@example.com")).toBeTruthy();
    expect(screen.getAllByText(/Hidden from/)).toHaveLength(2);
    expect(screen.getByText("Hidden from Blocked Assignee")).toBeTruthy();
    expect(screen.getByText("Step 2")).toBeTruthy();
    expect(screen.getByText("Step 2").className).toBe(screen.getByText("Step 1").className);
    expect(screen.getByLabelText("Hidden")).toBeTruthy();
    expect(screen.getByText("Current Assignee")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Step 1 visibility" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Step 2 completion rule" })).toBeNull();
    expect(screen.queryByText("Hidden Assignee")).toBeNull();
    expect(screen.queryByText("Hidden task comment")).toBeNull();
  });

  test("uses hidden-from-you wording as the icon tooltip when a hidden step has no visibility details", async () => {
    const user = userEvent.setup();

    render(
      <ApprovalSteps
        approvalRequest={{
          ...approvalRequest,
          steps: [
            {
              action: ApprovalRequestTaskAction.Approve,
              assignees: [],
              globalId: "hidden-without-visibility-id",
              isVisible: false,
              sequence: 1,
            },
          ],
        }}
      />,
    );

    const hiddenVisibilityIcon = screen.getByLabelText("Hidden from you");
    expect(hiddenVisibilityIcon).toBeTruthy();
    expect(screen.queryByText("Hidden from you")).toBeNull();
    await user.hover(hiddenVisibilityIcon);
    expect(await screen.findByText("Hidden from you")).toBeTruthy();
    expect(screen.queryByText("Visible to all request assignees.")).toBeNull();
  });

  test("opens hidden-from-you wording in a popover from the visibility icon", async () => {
    const user = userEvent.setup();

    render(
      <ApprovalSteps
        approvalRequest={{
          ...approvalRequest,
          steps: [
            {
              action: ApprovalRequestTaskAction.Approve,
              assignees: [],
              globalId: "hidden-without-visibility-id",
              isVisible: false,
              sequence: 1,
            },
          ],
        }}
      />,
    );

    const hiddenVisibilityIcon = screen.getByLabelText("Hidden from you");
    expect(hiddenVisibilityIcon.getAttribute("aria-describedby")).toBeNull();

    await user.click(hiddenVisibilityIcon);

    const popoverId = hiddenVisibilityIcon.getAttribute("aria-describedby");
    expect(popoverId).toBe("hidden-step-visibility-popover-hidden-without-visibility-id");
    expect(document.getElementById(popoverId ?? "")?.textContent).toBe("Hidden from you");
  });

  test("can hide visible step visibility summaries while keeping hidden step visibility summaries", () => {
    render(
      <ApprovalSteps
        approvalRequest={{
          ...approvalRequest,
          steps: approvalRequest.steps.map((step) =>
            step.isVisible === false
              ? { ...step, visibility: [] }
              : step,
          ),
        }}
        showVisibleStepVisibility={false}
      />,
    );

    expect(screen.queryByText("Blocked Assignee")).toBeNull();
    expect(screen.getByLabelText("Hidden from you")).toBeTruthy();
    expect(screen.queryByText("Hidden from you")).toBeNull();
  });

  test("shows task numbers and makes the current task row clickable", async () => {
    const user = userEvent.setup();
    const onHighlightedTaskClick = vi.fn();

    render(
      <ApprovalSteps
        approvalRequest={{
          ...approvalRequest,
          steps: [
            {
              ...approvalRequest.steps[0],
              tasks: [
                {
                  action: ApprovalRequestTaskAction.Approve,
                  approvalRequestGlobalId: "request-id",
                  approvalRequestStepAssigneeGlobalId: "visible-assignee-id",
                  approvalRequestStepGlobalId: "visible-step-id",
                  assigneeDisplayName: "Visible Assignee",
                  assigneeEmail: "visible@example.com",
                  createdAt,
                  createdAtDate,
                  organizationDisplayName: "Personal",
                  description: "Visible task description",
                  globalId: "visible-task-id",
                  requestedByDisplayName: "Requester",
                  requestedByEmail: "requester@example.com",
                  requestFiles: [],
                  revisionNumber: 1,
                  status: ApprovalRequestTaskStatus.Pending,
                  title: "Visible task",
                },
              ],
            },
          ],
        }}
        highlightedTaskGlobalId="visible-task-id"
        onHighlightedTaskClick={onHighlightedTaskClick}
      />,
    );

    expect(screen.getByText("Task #visib")).toBeTruthy();
    expect(screen.queryByText("Visible task description")).toBeNull();
    const currentTaskRow = screen.getByText("Task #visib").closest("[role='button']");
    expect(currentTaskRow?.textContent).toContain("visible@example.com");
    expect(screen.queryByLabelText("Current step assignee")).toBeNull();

    await user.click(currentTaskRow as HTMLElement);

    expect(onHighlightedTaskClick).toHaveBeenCalledOnce();
  });
});
