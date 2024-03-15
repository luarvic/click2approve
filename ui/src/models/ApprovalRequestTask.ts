import { IApprovalRequest } from "./ApprovalRequest";
import { ApprovalStatus } from "./ApprovalStatus";

export interface IApprovalRequestTask {
  id: number;
  approvalRequest: IApprovalRequest;
  approver: string;
  status: ApprovalStatus;
  completed: string;
  completedDate?: Date;
  comment?: string;
}
