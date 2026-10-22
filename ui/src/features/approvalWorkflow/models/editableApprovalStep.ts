import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import {
  AssigneeType,
  ApprovalStep,
  ApprovalStepAssignee,
  ApprovalStepMode,
  ApprovalStepVisibilityMode,
} from "@/features/approvalWorkflow/models/approvalStep";

export type EditableApprovalStep = ApprovalStep;

export const createEmptyAssignee = (type: AssigneeType = AssigneeType.User): ApprovalStepAssignee => ({
  globalId: crypto.randomUUID(),
  type,
  ...(type === AssigneeType.User ? { email: "" } : {}),
});

export const createEmptyStep = (
  sequence: number,
  includeEmptyAssignee: boolean = true,
  assigneeType: AssigneeType = AssigneeType.User,
): EditableApprovalStep => ({
  sequence,
  mode: ApprovalStepMode.Any,
  visibilityMode: ApprovalStepVisibilityMode.AllParticipants,
  action: ApprovalRequestTaskAction.Approve,
  isAttachmentRequired: false,
  isCommentRequired: false,
  isElectronicSignatureRequired: false,
  assignees: includeEmptyAssignee ? [createEmptyAssignee(assigneeType)] : [],
});

export const createEditableSteps = (steps: ApprovalStep[]): EditableApprovalStep[] =>
  steps.map((step, index) => ({
    ...step,
    sequence: index + 1,
    action: step.action ?? ApprovalRequestTaskAction.Approve,
    instructions: step.instructions,
    isAttachmentRequired: step.isAttachmentRequired ?? false,
    isCommentRequired: step.isCommentRequired ?? false,
    isElectronicSignatureRequired: step.isElectronicSignatureRequired ?? false,
    visibilityMode: step.visibilityMode ?? ApprovalStepVisibilityMode.AllParticipants,
    assignees: step.assignees.map((assignee) => ({ ...assignee })),
  }));

const toApprovalStep = (step: EditableApprovalStep): ApprovalStep => ({
  sequence: step.sequence,
  mode: step.mode ?? ApprovalStepMode.Any,
  visibilityMode: step.visibilityMode ?? ApprovalStepVisibilityMode.AllParticipants,
  action: step.action ?? ApprovalRequestTaskAction.Approve,
  instructions: step.instructions,
  isAttachmentRequired: step.isAttachmentRequired ?? false,
  isCommentRequired: step.isCommentRequired ?? false,
  isElectronicSignatureRequired: step.isElectronicSignatureRequired ?? false,
  assignees: step.assignees.map((assignee) => ({
    type: assignee.type,
    email: assignee.email,
    employeeGlobalId: assignee.employeeGlobalId,
    teamGlobalId: assignee.teamGlobalId,
  })),
});

export const toApprovalStepSubmissions = (steps: EditableApprovalStep[]): ApprovalStep[] => steps.map(toApprovalStep);
