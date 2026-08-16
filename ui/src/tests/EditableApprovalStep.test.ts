import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import {
  AssigneeType,
  ApprovalStepMode,
  ApprovalStepVisibilityMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import { createEmptyStep } from "@/features/approvalWorkflow/models/editableApprovalStep";
import { describe, expect, test } from "vitest";

describe("editable approval steps", () => {
  test("creates a new step with a blank assignee by default", () => {
    const step = createEmptyStep(2);

    expect(step).toMatchObject({
      sequence: 2,
      mode: ApprovalStepMode.Any,
      visibilityMode: ApprovalStepVisibilityMode.AllParticipants,
      action: ApprovalRequestTaskAction.Approve,
      assignees: [
        {
          type: AssigneeType.User,
          email: "",
        },
      ],
    });
    expect(step.assignees[0]?.globalId).toBeTypeOf("string");
  });
});
