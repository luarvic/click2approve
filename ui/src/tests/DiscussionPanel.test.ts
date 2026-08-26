import { AssigneeType, type ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import DiscussionMessageList from "@/features/discussions/components/DiscussionMessageList";
import { getDiscussionMessageSender } from "@/features/discussions/components/DiscussionPanel";
import type { DiscussionMessage } from "@/features/discussions/models/discussionMessage";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, test } from "vitest";

const message: DiscussionMessage = {
  approvalRequestStepGlobalId: "f2828e32-2212-4d06-a2d7-f0603571b7b0",
  body: "Hello",
  createdAt: "2026-08-11T16:11:21.8860840Z",
  globalId: "19286f65-5201-4195-a08b-2fc1804234f5",
  isDelegated: false,
  isOutgoing: false,
  sentByDisplayName: "Employee name, Position",
  sentByType: AssigneeType.Employee,
};

describe("getDiscussionMessageSender", () => {
  test("uses the sender display name", () => {
    expect(getDiscussionMessageSender(message)).toBe("Employee name, Position");
  });
});

describe("<DiscussionMessageList />", () => {
  test("shows participants while messages are loading", () => {
    const steps: ApprovalStep[] = [
      {
        action: ApprovalRequestTaskAction.Approve,
        assignees: [
          {
            displayName: "Approver",
            globalId: "assignee-1",
            type: AssigneeType.Employee,
          },
        ],
        globalId: "step-1",
        sequence: 1,
      },
    ];

    render(
      createElement(DiscussionMessageList, {
        attachmentsAreEnabled: false,
        messages: null,
        requesterDisplayName: "Requester",
        requesterEmail: "requester@example.com",
        requesterType: AssigneeType.Employee,
        stepLabels: {},
        steps,
        taskApprovalRequestStepGlobalId: "step-1",
        taskGlobalId: "task-1",
        tenantGlobalId: "tenant-1",
      }),
    );

    expect(screen.getByText("Participants · 2")).toBeTruthy();
    expect(screen.getByText("Requester")).toBeTruthy();
    expect(screen.getByText("Approver")).toBeTruthy();
  });
});
