import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { UserFile } from "@/features/userFiles/models/userFile";
import { ApprovalRequestTaskLogEntry } from "./approvalRequestLogEntry";
import { ApprovalRequestTaskListItem } from "./approvalRequestTaskListItem";

export interface ApprovalRequestTask extends ApprovalRequestTaskListItem {
  approvalRequest?: ApprovalRequest;
  approvalRequestId: number;
  approvalRequestStepId: number;
  approvalRequestStepApproverId?: number;
  approverUserId?: string;
  approverEmail: string;
  approverDisplayName: string;
  requestedByDisplayName: string;
  canViewRequest: boolean;
  description?: string;
  comment?: string;
  userFiles: UserFile[];
  logEntries: ApprovalRequestTaskLogEntry[];
}
