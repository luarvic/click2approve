import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestFile } from "./approvalRequest";
import { ApprovalRequestTaskListItem } from "./approvalRequestTaskListItem";

export interface ApprovalRequestTask extends ApprovalRequestTaskListItem {
  approvalRequest?: ApprovalRequest;
  approvalRequestGlobalId: string;
  approvalRequestStepGlobalId: string;
  approvalRequestStepAssigneeGlobalId?: string;
  assigneeUserId?: string;
  assigneeEmail: string;
  assigneeDisplayName: string;
  completedByDisplayName?: string;
  completedByEmail?: string;
  requestedByEmail: string;
  requestedByDisplayName: string;
  organizationDisplayName: string;
  description?: string;
  comment?: string;
  assigneeIpAddress?: string;
  assigneeBrowserData?: string;
  assigneeLegalName?: string;
  hasAssigneeSignature?: boolean;
  assigneeSignatureJson?: string;
  requestFiles: ApprovalRequestFile[];
}
