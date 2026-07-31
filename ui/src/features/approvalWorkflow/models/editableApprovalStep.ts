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
  approvers: includeEmptyApprover ? [createEmptyApprover()] : [],
});

export const createEditableSteps = (
  steps: ApprovalStep[],
): EditableApprovalStep[] =>
  steps.map((step, index) => ({
    ...step,
    sequence: index + 1,
    approvers: step.approvers.map((approver) => ({ ...approver })),
  }));

const toApprovalStep = (step: EditableApprovalStep): ApprovalStep => ({
  sequence: step.sequence,
  mode: step.mode ?? ApprovalStepMode.Any,
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
