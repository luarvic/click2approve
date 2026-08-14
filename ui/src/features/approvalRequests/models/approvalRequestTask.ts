import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestFile } from "./approvalRequest";
import { ApprovalRequestTaskListItem } from "./approvalRequestTaskListItem";
import { UserFile } from "@/features/userFiles/models/userFile";

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
  assigneeOrganization?: string;
  hasAssigneeSignature?: boolean;
  isAssigneeEmployee?: boolean;
  assigneeSignatureJson?: string;
  requestFiles: ApprovalRequestFile[];
  taskFiles?: UserFile[];
}
