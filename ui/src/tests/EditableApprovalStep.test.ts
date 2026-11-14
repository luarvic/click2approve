import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import {
  AssigneeType,
  ApprovalStepMode,
  ApprovalStepVisibilityMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  createEmptyStep,
  createEditableSteps,
  toApprovalStepSubmissions,
} from "@/features/approvalWorkflow/models/editableApprovalStep";
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

describe("email assignee serialization", () => {
  test("new commercial email assignees default to Guest but old saved assignees retain sign-in", () => {
    const step = createEmptyStep(1);
    expect(toApprovalStepSubmissions([step], true)[0].assignees[0].accountSignInRequired).toBe(false);
    const loaded = createEditableSteps([step]);
    expect(toApprovalStepSubmissions(loaded, true)[0].assignees[0].accountSignInRequired).toBe(true);
  });
  test("User and Guest remain API User assignees, and unavailable guest access is forced to sign-in", () => {
    const step = createEmptyStep(1);
    step.assignees = [
      { type: AssigneeType.User, email: "guest@example.com", accountSignInRequired: false },
      { type: AssigneeType.User, email: "user@example.com", accountSignInRequired: true },
      { type: AssigneeType.Employee, employeeGlobalId: "employee", accountSignInRequired: false },
    ];
    expect(
      toApprovalStepSubmissions([step], true)[0].assignees.map(({ type, accountSignInRequired }) => ({
        type,
        accountSignInRequired,
      })),
    ).toEqual([
      { type: AssigneeType.User, accountSignInRequired: false },
      { type: AssigneeType.User, accountSignInRequired: true },
      { type: AssigneeType.Employee, accountSignInRequired: true },
    ]);
    expect(toApprovalStepSubmissions([step])[0].assignees.every((assignee) => assignee.accountSignInRequired)).toBe(
      true,
    );
  });
});
