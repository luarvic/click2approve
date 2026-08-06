import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import {
  AssigneeType,
  ApprovalStepMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import { createEmptyStep } from "@/features/approvalWorkflow/models/editableApprovalStep";
import { describe, expect, test } from "vitest";

describe("editable approval steps", () => {
  test("creates a new step with a blank assignee by default", () => {
    expect(createEmptyStep(2)).toEqual({
      sequence: 2,
      mode: ApprovalStepMode.Any,
      action: ApprovalRequestTaskAction.Approve,
      assignees: [
        {
          type: AssigneeType.Email,
          email: "",
        },
      ],
    });
  });
});
