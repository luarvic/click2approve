import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import ApprovalStepDetails, {
  type ApprovalStepAttribute,
} from "@/features/approvalWorkflow/components/ApprovalStepDetails";
import { AssigneeType, type ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

const step: ApprovalStep = {
  sequence: 1,
  action: ApprovalRequestTaskAction.Approve,
  isCommentRequired: true,
  assignees: [{ globalId: "employee-a", type: AssigneeType.Employee, displayName: "Alex" }],
};
const attributes: ApprovalStepAttribute[] = ["completion", "visibility", "requirements", "assignees", "participants"];
const labels = ["Any assignee", "All participants", "Comment required", "Alex", "Chat participants"];

describe("configurable step attributes", () => {
  test.each(attributes)("shows only the selected %s attribute", (attribute) => {
    render(<ApprovalStepDetails step={step} attributes={[attribute]} participants={<span>Chat participants</span>} />);
    labels.forEach((label, index) => {
      expect(Boolean(screen.queryByText(label))).toBe(attributes[index] === attribute);
    });
  });

  test("can suppress all attributes", () => {
    render(<ApprovalStepDetails step={step} attributes={[]} participants={<span>Chat participants</span>} />);
    labels.forEach((label) => expect(screen.queryByText(label)).toBeNull());
  });
});
