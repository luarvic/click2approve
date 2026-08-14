import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { ApprovalRequestStepVisibilitySubmission } from "@/features/approvalRequests/models/approvalRequest";

export interface ApprovalStepTemplate {
  globalId: string;
  tenantGlobalId: string;
  name: string;
  steps: ApprovalStep[];
}

export interface UpsertApprovalStepTemplateRequest {
  name: string;
  stepVisibility: ApprovalRequestStepVisibilitySubmission[];
  steps: ApprovalStep[];
}
