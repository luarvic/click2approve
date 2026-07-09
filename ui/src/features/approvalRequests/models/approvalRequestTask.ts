import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTaskStatus } from "./approvalRequestTaskStatus";

export interface ApprovalRequestTask {
  id: number;
  title: string;
  approvalRequest: ApprovalRequest;
  approvalRequestId: number;
  approvalRequestStepId: number;
  approvalRequestStepApproverId?: number;
  approverUserId?: string;
  approverEmail: string;
  approverDisplayName?: string;
  canViewRequest: boolean;
  status: ApprovalRequestTaskStatus;
  createdAt: string;
  createdAtDate: Date;
  completedAt?: string;
  completedAtDate?: Date;
  comment?: string;
}
