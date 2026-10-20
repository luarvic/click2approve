import { stores } from "@/app/rootStore";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import { ApprovalStepVisibilityMode, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { EmployeeRole, TenantType } from "@/features/tenants/models/tenant";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { describe, expect, test, vi } from "vitest";

const createdAt = "2026-07-29T12:00:00Z";
const createdAtDate = new Date(createdAt);

const approvalRequest: ApprovalRequest = {
  createdAt,
  createdAtDate,
  requesterDisplayName: "Requester",
  submittedByDisplayName: "Requester",
  requesterEmail: "requester@example.com",
  submittedByEmail: "requester@example.com",
  organizationDisplayName: "Personal",
  requesterUserGlobalId: "a81de868-eb2a-4d66-ba7d-f82135ac8a89",
  submittedByUserGlobalId: "a81de868-eb2a-4d66-ba7d-f82135ac8a89",
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

const expandStepDetails = async () => {
  await userEvent.setup().click(screen.getByRole("button", { name: "Expand Step 1 · Approve" }));
};

describe("<ApprovalSteps />", () => {
  test("does not present the Personal workspace as an upcoming task's organization", () => {
    const previousTenants = stores.tenantStore.tenants;
    const previousTenantGlobalId = stores.tenantStore.currentTenantGlobalId;
    runInAction(() => {
      stores.tenantStore.tenants = [
        {
          globalId: "personal-workspace",
          businessName: "Personal",
          type: TenantType.Personal,
          currentEmployeeRole: EmployeeRole.Owner,
        },
      ];
      stores.tenantStore.currentTenantGlobalId = "personal-workspace";
    });
    try {
      render(<ApprovalSteps approvalRequest={approvalRequest} limitWorkflowFields />);
      const upcomingTask = within(screen.getByLabelText("Upcoming task"));
      expect(upcomingTask.getByText("visible@example.com")).toBeTruthy();
      expect(upcomingTask.queryByText("From organization")).toBeNull();
      expect(upcomingTask.queryByText("Personal")).toBeNull();
    } finally {
      runInAction(() => {
        stores.tenantStore.tenants = previousTenants;
        stores.tenantStore.currentTenantGlobalId = previousTenantGlobalId;
      });
    }
  });
  test("shows hidden steps without leaking their details", async () => {
    render(<ApprovalSteps approvalRequest={approvalRequest} limitWorkflowFields />);

    expect(screen.getByText("Step 1 · Approve")).toBeTruthy();
    await expandStepDetails();
    expect(screen.getByLabelText("Step 1 completion rule Any assignee")).toBeTruthy();
    expect(screen.getByLabelText("Step 1 visibility Organization employees")).toBeTruthy();
    expect(
      within(screen.getByRole("list", { name: "Step 1 assignees" })).getByText("visible@example.com"),
    ).toBeTruthy();
    expect(screen.getByLabelText("Upcoming task")).toBeTruthy();
    expect(screen.queryByText("Details")).toBeNull();
    expect(screen.getByText("Activity")).toBeTruthy();
    expect(screen.getByText("Assignee")).toBeTruthy();
    expect(screen.queryByText("Status")).toBeNull();
    const upcomingTaskCard = screen.getByLabelText("Upcoming task");
    expect(screen.queryByText("None")).toBeNull();
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

  test("can hide visible step visibility summaries", async () => {
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

    await expandStepDetails();
    expect(screen.queryByLabelText("Step 1 visibility Organization employees")).toBeNull();
    expect(screen.queryByText("Blocked Assignee")).toBeNull();
    expect(screen.getByTestId("hidden-step-icon")).toBeTruthy();
  });

  test("lists mixed original assignees without grouping upcoming tasks", async () => {
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

    await expandStepDetails();
    const assignees = within(screen.getByRole("list", { name: "Step 1 assignees" }));
    expect(assignees.getByText("Finance team")).toBeTruthy();
    expect(assignees.getByText("visible@example.com")).toBeTruthy();
    expect(screen.queryByText("Individual assignees")).toBeNull();
    expect(screen.queryByRole("button", { name: "Finance team" })).toBeNull();
    expect(screen.getAllByLabelText("Upcoming task")).toHaveLength(2);
  });

  test("shows tasks from multiple teams and individual assignments in one list with team provenance", async () => {
    const assignees = [
      { globalId: "finance", type: AssigneeType.Team, displayName: "Finance" },
      { globalId: "management", type: AssigneeType.Team, displayName: "Management" },
      { globalId: "employee", type: AssigneeType.Employee, displayName: "Jamie" },
      { globalId: "email", type: AssigneeType.User, email: "external@example.com" },
    ];
    const tasks = assignees.map((assignee, index) => ({
      ...approvalRequest.steps[1].tasks![0],
      globalId: `task-${index}`,
      approvalRequestStepGlobalId: "visible-step-id",
      approvalRequestStepAssigneeGlobalId: assignee.globalId,
      assigneeDisplayName: `Recipient ${index}`,
      assigneeEmail: index === 3 ? "external@example.com" : `recipient${index}@example.com`,
      isAssigneeEmployee: index !== 3,
    }));
    render(
      <ApprovalSteps
        approvalRequest={{
          ...approvalRequest,
          steps: [{ ...approvalRequest.steps[0], assignees, tasks }],
        }}
        collapseCards
      />,
    );

    await expandStepDetails();
    const originalAssignees = within(screen.getByRole("list", { name: "Step 1 assignees" }));
    expect(originalAssignees.getAllByRole("listitem")).toHaveLength(4);
    expect(originalAssignees.getAllByTestId("GroupsOutlinedIcon")).toHaveLength(2);
    expect(originalAssignees.getByTestId("PersonOutlinedIcon")).toBeTruthy();
    expect(originalAssignees.getByTestId("EmailOutlinedIcon")).toBeTruthy();
    const cards = screen.getAllByLabelText("Pending");
    expect(cards).toHaveLength(4);
    expect(new Set(cards.map((card) => card.parentElement)).size).toBe(1);
    expect(screen.queryByText("Assigned via")).toBeNull();
    const user = userEvent.setup();
    for (const button of screen.getAllByRole("button", { name: /Expand Task/ })) {
      await user.click(button);
    }
    expect(screen.getAllByText("Assigned via")).toHaveLength(2);
    tasks.forEach((task, index) => {
      const card = within(cards[index]);
      if (index < 2) {
        expect(card.getByText(assignees[index].displayName!)).toBeTruthy();
      } else {
        expect(card.queryByText("Assigned via")).toBeNull();
      }
      const recipient = card.getByText(index === 3 ? task.assigneeEmail : task.assigneeDisplayName).parentElement!;
      expect(within(recipient).getByTestId(index === 3 ? "EmailOutlinedIcon" : "PersonOutlinedIcon")).toBeTruthy();
    });
  });

  test("toggles step details with the keyboard while task cards stay visible", async () => {
    render(<ApprovalSteps approvalRequest={approvalRequest} collapseCards />);
    expect(screen.queryByRole("list", { name: "Step 1 assignees" })).toBeNull();
    const toggle = screen.getByRole("button", { name: "Expand Step 1 · Approve" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    toggle.focus();
    await userEvent.setup().keyboard("{Enter}");
    expect(within(screen.getByRole("region", { name: "Step 1 details" })).getByText("Any assignee")).toBeTruthy();
    expect(screen.getByRole("list", { name: "Step 1 assignees" })).toBeTruthy();
    await userEvent.setup().click(screen.getByRole("button", { name: "Expand Upcoming task" }));
    await userEvent.setup().click(screen.getByRole("button", { name: "Collapse Step 1 · Approve" }));
    expect(screen.getByRole("button", { name: "Collapse Upcoming task" })).toBeTruthy();
    expect(screen.getByLabelText("Upcoming task")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Expand Step 1 · Approve" }).getAttribute("aria-expanded")).toBe("false");
  });

  test("can expand upcoming task cards", async () => {
    const user = userEvent.setup();

    render(<ApprovalSteps approvalRequest={approvalRequest} collapseCards limitWorkflowFields />);

    expect(screen.queryByText("Assignee")).toBeNull();
    const expandButton = screen.getByRole("button", { name: "Expand Upcoming task" });
    expect(expandButton.getAttribute("aria-expanded")).toBe("false");

    await user.click(expandButton);

    expect(screen.getByText("Assignee")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Collapse Upcoming task" }).getAttribute("aria-expanded")).toBe("true");
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

    await expandStepDetails();
    expect(screen.getByText("Task #visib")).toBeTruthy();
    expect(screen.queryByText("Visible task description")).toBeNull();
    expect(screen.queryByText("Files")).toBeNull();
    expect(screen.queryByText("Requested by")).toBeNull();
    expect(screen.queryByText("Revision")).toBeNull();
    expect(
      within(screen.getByRole("list", { name: "Step 1 assignees" })).getByText("visible@example.com"),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Collapse Task #visib" })).toBeTruthy();
    const currentTaskRow = screen.getByText("Task #visib").closest("[role='button']");
    expect(currentTaskRow?.textContent).toContain("visible@example.com");
    expect(screen.queryByLabelText("Current step assignee")).toBeNull();

    await user.click(currentTaskRow as HTMLElement);

    expect(onHighlightedTaskClick).toHaveBeenCalledOnce();
  });
});
