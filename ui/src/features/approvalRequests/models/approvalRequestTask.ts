import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTaskListItem } from "./approvalRequestTaskListItem";

export interface ApprovalRequestTask extends ApprovalRequestTaskListItem {
  approvalRequest?: ApprovalRequest;
  approvalRequestId: number;
  approvalRequestStepId: number;
  approvalRequestStepApproverId?: number;
  approverUserId?: string;
  approverEmail: string;
  approverDisplayName?: string;
  canViewRequest: boolean;
  description?: string;
  comment?: string;
}
