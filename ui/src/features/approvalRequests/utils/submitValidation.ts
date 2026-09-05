import { ApprovalStepAssignee, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { EditableApprovalStep } from "@/features/approvalWorkflow/models/editableApprovalStep";
import { validateEmail } from "@/shared/utils/validators";

export const getAssigneeError = (assignee: ApprovalStepAssignee): string | undefined => {
  switch (assignee.type) {
    case AssigneeType.User:
      return validateEmail(assignee.email?.trim() ?? "") ? undefined : "Enter a valid email address.";
    case AssigneeType.Employee:
      return assignee.employeeGlobalId ? undefined : "Choose an employee.";
    case AssigneeType.Team:
      return assignee.teamGlobalId ? undefined : "Choose a team.";
    default:
      return "Choose an assignee type.";
  }
};

export const getStepErrors = (steps: EditableApprovalStep[]) =>
  steps.map((step) =>
    step.assignees.length === 0
      ? "Add at least one assignee."
      : step.assignees.some((assignee) => getAssigneeError(assignee))
        ? "Complete the highlighted assignees."
        : undefined,
  );
