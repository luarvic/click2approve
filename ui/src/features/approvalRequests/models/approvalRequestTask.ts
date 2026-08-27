import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestFile } from "./approvalRequest";
import { ApprovalRequestTaskListItem } from "./approvalRequestTaskListItem";
import { UserFile } from "@/features/userFiles/models/userFile";

export interface ApprovalRequestTask extends ApprovalRequestTaskListItem {
  approvalRequest?: ApprovalRequest;
  approvalRequestGlobalId: string;
  approvalRequestStepGlobalId: string;
  approvalRequestStepAssigneeGlobalId?: string;
  assigneeEmail: string;
  assigneeDisplayName: string;
  completedAt?: string;
  completedAtDate?: Date;
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
  assigneeRepresentationDetails?: string;
  instructions?: string;
  isAttachmentRequired?: boolean;
  isCommentRequired?: boolean;
  isElectronicSignatureRequired?: boolean;
  hasAssigneeSignature?: boolean;
  isAssigneeEmployee?: boolean;
  assigneeSignatureJson?: string;
  requestFiles: ApprovalRequestFile[];
  taskFiles?: UserFile[];
}
