import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import { ApprovalStepVisibilityMode, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
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
  createdByUserGlobalId: "a81de868-eb2a-4d66-ba7d-f82135ac8a89",
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
          type: AssigneeType.User,
        },
      ],
      globalId: "visible-step-id",
      sequence: 1,
      visibilityMode: ApprovalStepVisibilityMode.OrganizationEmployees,
    },
    {
      action: ApprovalRequestTaskAction.Approve,
      assignees: [
        {
          displayName: "Hidden Assignee",
          email: "hidden@example.com",
          globalId: "hidden-assignee-id",
          type: AssigneeType.User,
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
    },
  ],
  title: "Request title",
};

describe("<ApprovalSteps />", () => {
  test("shows hidden steps without leaking their details", () => {
    render(<ApprovalSteps approvalRequest={approvalRequest} limitWorkflowFields />);

    expect(screen.getByText("Step 1")).toBeTruthy();
    expect(screen.getByLabelText("Step 1 action Approve")).toBeTruthy();
    expect(screen.getByLabelText("Step 1 completion rule Any assignee")).toBeTruthy();
    expect(screen.getByLabelText("Step 1 visibility Organization employees")).toBeTruthy();
    expect(screen.getByText("visible@example.com")).toBeTruthy();
    expect(screen.getByLabelText("Upcoming task")).toBeTruthy();
    expect(screen.getByText("Details")).toBeTruthy();
    expect(screen.getByText("Activity")).toBeTruthy();
    expect(screen.getByText("Assignee")).toBeTruthy();
    expect(screen.getByText("Status")).toBeTruthy();
    const upcomingTaskCard = screen.getByLabelText("Upcoming task");
    expect(screen.getAllByText("None")).toHaveLength(2);
    expect(upcomingTaskCard.querySelector("[data-testid='PendingOutlinedIcon']")).toBeNull();
    expect(screen.getByText("Step 2")).toBeTruthy();
    expect(screen.getByTestId("hidden-step-icon")).toBeTruthy();
    expect(screen.queryByLabelText("Hidden")).toBeNull();
    expect(screen.queryByText("Current Assignee")).toBeNull();
    expect(screen.queryByRole("button", { name: "Step 1 visibility" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Step 2 completion rule" })).toBeNull();
    expect(screen.queryByText("Hidden Assignee")).toBeNull();
    expect(screen.queryByText("Hidden task comment")).toBeNull();
  });

  test("can hide visible step visibility summaries", () => {
    render(
      <ApprovalSteps
        approvalRequest={{
          ...approvalRequest,
          steps: approvalRequest.steps,
        }}
        limitWorkflowFields
        showVisibleStepVisibility={false}
      />,
    );

    expect(screen.queryByText("Blocked Assignee")).toBeNull();
    expect(screen.getByTestId("hidden-step-icon")).toBeTruthy();
  });

  test("groups individual assignees when a step also has a team", () => {
    render(
      <ApprovalSteps
        approvalRequest={{
          ...approvalRequest,
          steps: [
            {
              ...approvalRequest.steps[0],
              assignees: [
                approvalRequest.steps[0].assignees[0],
                {
                  displayName: "Finance team",
                  globalId: "finance-team-id",
                  type: AssigneeType.Team,
                },
              ],
            },
          ],
        }}
        limitWorkflowFields
      />,
    );

    expect(screen.getByText("Individual assignees")).toBeTruthy();
    expect(screen.getAllByLabelText("Upcoming task")).toHaveLength(2);
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
        collapseCards
        highlightedTaskGlobalId="visible-task-id"
        limitWorkflowFields
        onHighlightedTaskClick={onHighlightedTaskClick}
      />,
    );

    expect(screen.getByText("Task #visib")).toBeTruthy();
    expect(screen.queryByText("Visible task description")).toBeNull();
    expect(screen.queryByText("Files")).toBeNull();
    expect(screen.queryByText("Requested by")).toBeNull();
    expect(screen.queryByText("Revision")).toBeNull();
    expect(screen.getByText("visible@example.com")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Collapse Task #visib" })).toBeTruthy();
    const currentTaskRow = screen.getByText("Task #visib").closest("[role='button']");
    expect(currentTaskRow?.textContent).toContain("visible@example.com");
    expect(screen.queryByLabelText("Current step assignee")).toBeNull();

    await user.click(currentTaskRow as HTMLElement);

    expect(onHighlightedTaskClick).toHaveBeenCalledOnce();
  });
});
