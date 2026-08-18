import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";

export const getApprovalRequestStepLabels = (approvalRequest: ApprovalRequest): Record<string, string> =>
  Object.fromEntries(
    approvalRequest.steps.filter((step) => step.globalId).map((step) => [step.globalId!, `Step ${step.sequence}`]),
  );
