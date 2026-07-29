import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";

export interface ApprovalStepTemplate {
  globalId: string;
  tenantGlobalId: string;
  name: string;
  steps: ApprovalStep[];
}

export interface UpsertApprovalStepTemplateRequest {
  name: string;
  steps: ApprovalStep[];
}
