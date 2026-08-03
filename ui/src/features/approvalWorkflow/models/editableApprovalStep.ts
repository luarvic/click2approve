import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import {
  ApprovalRecipientType,
  ApprovalStep,
  ApprovalStepApprover,
  ApprovalStepMode,
} from "@/features/approvalWorkflow/models/approvalStep";

export type EditableApprovalStep = ApprovalStep;

export const createEmptyApprover = (): ApprovalStepApprover => ({
  type: ApprovalRecipientType.Email,
  email: "",
});

export const createEmptyStep = (
  sequence: number,
  includeEmptyApprover: boolean = true,
): EditableApprovalStep => ({
  sequence,
  mode: ApprovalStepMode.Any,
  action: ApprovalRequestTaskAction.Approve,
  approvers: includeEmptyApprover ? [createEmptyApprover()] : [],
});

export const createEditableSteps = (
  steps: ApprovalStep[],
): EditableApprovalStep[] =>
  steps.map((step, index) => ({
    ...step,
    sequence: index + 1,
    action: step.action ?? ApprovalRequestTaskAction.Approve,
    approvers: step.approvers.map((approver) => ({ ...approver })),
  }));

const toApprovalStep = (step: EditableApprovalStep): ApprovalStep => ({
  sequence: step.sequence,
  mode: step.mode ?? ApprovalStepMode.Any,
  action: step.action ?? ApprovalRequestTaskAction.Approve,
  approvers: step.approvers.map((approver) => ({
    type: approver.type,
    email: approver.email,
    employeeGlobalId: approver.employeeGlobalId,
    teamGlobalId: approver.teamGlobalId,
    requiresIdentityVerification: approver.requiresIdentityVerification === true,
  })),
});

export const toApprovalStepSubmissions = (
  steps: EditableApprovalStep[],
): ApprovalStep[] => steps.map(toApprovalStep);
