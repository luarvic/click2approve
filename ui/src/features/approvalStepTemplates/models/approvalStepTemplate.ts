import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";

export interface ApprovalStepTemplate {
  id: number;
  tenantId: number;
  name: string;
  steps: ApprovalStep[];
}

export interface UpsertApprovalStepTemplateRequest {
  name: string;
  steps: ApprovalStep[];
}
