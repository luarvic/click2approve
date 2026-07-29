import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import { ApprovalRecipientType } from "@/features/approvalWorkflow/models/approvalStep";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

const createdAt = "2026-07-29T12:00:00Z";
const createdAtDate = new Date(createdAt);

const approvalRequest: ApprovalRequest = {
  createdAt,
  createdAtDate,
  createdByDisplayName: "Requester",
  createdByEmail: "requester@example.com",
  createdByUserId: "requester-user-id",
  description: "Request description",
  globalId: "request-id",
  logEntries: [],
  requestFiles: [],
  revisionNumber: 1,
  status: ApprovalRequestStatus.Pending,
  steps: [
    {
      approvers: [
        {
          displayName: "Visible Approver",
          email: "visible@example.com",
          globalId: "visible-approver-id",
          type: ApprovalRecipientType.Email,
        },
      ],
      globalId: "visible-step-id",
      sequence: 1,
    },
    {
      approvers: [
        {
          displayName: "Hidden Approver",
          email: "hidden@example.com",
          globalId: "hidden-approver-id",
          type: ApprovalRecipientType.Email,
        },
      ],
      globalId: "hidden-step-id",
      isVisible: false,
      sequence: 2,
      tasks: [
        {
          approvalRequestGlobalId: "request-id",
          approvalRequestStepApproverGlobalId: "hidden-approver-id",
          approvalRequestStepGlobalId: "hidden-step-id",
          approverDisplayName: "Hidden Approver",
          approverEmail: "hidden@example.com",
          comment: "Hidden task comment",
          createdAt,
          createdAtDate,
          globalId: "hidden-task-id",
          logEntries: [],
          requestFiles: [],
          requestedByDisplayName: "Requester",
          status: ApprovalRequestTaskStatus.Pending,
          title: "Hidden task",
        },
      ],
      visibility: [
        {
          approverDisplayName: "Current Approver",
          approverGlobalId: "visible-approver-id",
          approverType: ApprovalRecipientType.Email,
          isVisible: false,
        },
      ],
    },
  ],
  taskLogEntries: [],
  title: "Request title",
};

describe("<ApprovalSteps />", () => {
  test("shows a dotted title placeholder for hidden steps without leaking hidden details", async () => {
    const user = userEvent.setup();
    render(<ApprovalSteps approvalRequest={approvalRequest} />);

    expect(screen.getByText("Step 1")).toBeTruthy();
    expect(screen.getByText("Visible Approver")).toBeTruthy();
    expect(screen.getByText("Step 2")).toBeTruthy();
    expect(screen.getByLabelText("Hidden")).toBeTruthy();
    expect(screen.getByTestId("VisibilityIcon")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Step 1 visibility" }));
    expect(screen.getByText("Visible to all request approvers.")).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: "Step 2 completion rule" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Step 2 visibility" }));
    expect(screen.getByText("Hidden from:")).toBeTruthy();
    expect(screen.getByText("Current Approver")).toBeTruthy();
    expect(screen.queryByText("Hidden Approver")).toBeNull();
    expect(screen.queryByText("Hidden task comment")).toBeNull();
  });

  test("uses hidden-from-you wording when a hidden step has no visibility details", async () => {
    const user = userEvent.setup();
    render(
      <ApprovalSteps
        approvalRequest={{
          ...approvalRequest,
          steps: [
            {
              approvers: [],
              globalId: "hidden-without-visibility-id",
              isVisible: false,
              sequence: 1,
            },
          ],
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Step 1 visibility" }));
    expect(screen.getByText("This step is hidden from you.")).toBeTruthy();
    expect(screen.queryByText("Visible to all request approvers.")).toBeNull();
  });

  test("can hide visible step visibility controls while keeping hidden step visibility controls", async () => {
    const user = userEvent.setup();
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

    expect(screen.queryByRole("button", { name: "Step 1 visibility" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Step 2 visibility" }));
    expect(screen.getByText("This step is hidden from you.")).toBeTruthy();
  });
});
