import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestFile } from "./approvalRequest";
import { ApprovalRequestTaskLogEntry } from "./approvalRequestLogEntry";
import { ApprovalRequestTaskListItem } from "./approvalRequestTaskListItem";

export interface ApprovalRequestTask extends ApprovalRequestTaskListItem {
  approvalRequest?: ApprovalRequest;
  approvalRequestGlobalId: string;
  approvalRequestStepGlobalId: string;
  approvalRequestStepApproverGlobalId?: string;
  approverUserId?: string;
  approverEmail: string;
  approverDisplayName: string;
  requestedByDisplayName: string;
  description?: string;
  comment?: string;
  requiresIdentityVerification?: boolean;
  approverIpAddress?: string;
  approverBrowserData?: string;
  approverLegalFirstName?: string;
  approverLegalLastName?: string;
  approverDateOfBirth?: string;
  hasApproverSignature?: boolean;
  approverSignatureJson?: string;
  requestFiles: ApprovalRequestFile[];
  logEntries: ApprovalRequestTaskLogEntry[];
}
