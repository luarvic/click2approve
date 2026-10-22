import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";

export interface ApprovalStepTemplate {
  description?: string;
  globalId: string;
  tenantGlobalId: string;
  name: string;
  steps: ApprovalStep[];
}

export interface UpsertApprovalStepTemplateRequest {
  description: string;
  name: string;
  steps: ApprovalStep[];
}
