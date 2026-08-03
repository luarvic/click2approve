import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestFile } from "./approvalRequest";
import { ApprovalRequestTaskListItem } from "./approvalRequestTaskListItem";

export interface ApprovalRequestTask extends ApprovalRequestTaskListItem {
  approvalRequest?: ApprovalRequest;
  approvalRequestGlobalId: string;
  approvalRequestStepGlobalId: string;
  approvalRequestStepApproverGlobalId?: string;
  approverUserId?: string;
  approverEmail: string;
  approverDisplayName: string;
  approverOrganizationDisplayName?: string;
  requestedByEmail: string;
  requestedByDisplayName: string;
  createdByOrganizationDisplayName: string;
  description?: string;
  comment?: string;
  requiresIdentityVerification?: boolean;
  approverIpAddress?: string;
  approverBrowserData?: string;
  approverLegalName?: string;
  approverDateOfBirth?: string;
  hasApproverSignature?: boolean;
  approverSignatureJson?: string;
  requestFiles: ApprovalRequestFile[];
}
