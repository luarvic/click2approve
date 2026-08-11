import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import {
  AssigneeType,
  ApprovalStep,
  ApprovalStepAssignee,
  ApprovalStepMode,
} from "@/features/approvalWorkflow/models/approvalStep";

export type EditableApprovalStep = ApprovalStep;

export const createEmptyAssignee = (): ApprovalStepAssignee => ({
  type: AssigneeType.User,
  email: "",
});

export const createEmptyStep = (
  sequence: number,
  includeEmptyAssignee: boolean = true,
): EditableApprovalStep => ({
  sequence,
  mode: ApprovalStepMode.Any,
  action: ApprovalRequestTaskAction.Approve,
  assignees: includeEmptyAssignee ? [createEmptyAssignee()] : [],
});

export const createEditableSteps = (
  steps: ApprovalStep[],
): EditableApprovalStep[] =>
  steps.map((step, index) => ({
    ...step,
    sequence: index + 1,
    action: step.action ?? ApprovalRequestTaskAction.Approve,
    assignees: step.assignees.map((assignee) => ({ ...assignee })),
  }));

const toApprovalStep = (step: EditableApprovalStep): ApprovalStep => ({
  sequence: step.sequence,
  mode: step.mode ?? ApprovalStepMode.Any,
  action: step.action ?? ApprovalRequestTaskAction.Approve,
  assignees: step.assignees.map((assignee) => ({
    type: assignee.type,
    email: assignee.email,
    employeeGlobalId: assignee.employeeGlobalId,
    teamGlobalId: assignee.teamGlobalId,
  })),
});

export const toApprovalStepSubmissions = (
  steps: EditableApprovalStep[],
): ApprovalStep[] => steps.map(toApprovalStep);
