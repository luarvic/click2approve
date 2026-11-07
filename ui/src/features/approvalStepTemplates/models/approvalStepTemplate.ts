import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";

export interface ApprovalStepTemplateListItem {
  description?: string;
  globalId: string;
  isOwner: boolean;
  name: string;
  ownerDisplayName: string;
  shared: boolean;
}

export interface ApprovalStepTemplate extends ApprovalStepTemplateListItem {
  tenantGlobalId: string;
  steps: ApprovalStep[];
}

export interface UpsertApprovalStepTemplateRequest {
  description: string;
  name: string;
  shared: boolean;
  steps: ApprovalStep[];
}
