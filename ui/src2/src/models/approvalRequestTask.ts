import { IApprovalRequest } from "./approvalRequest";
import { ApprovalStatus } from "./approvalStatus";

export interface IApprovalRequestTask {
  id: number;
  approvalRequest: IApprovalRequest;
  approver: string;
  status: ApprovalStatus;
  completed?: string;
  completedDate?: Date;
  comment?: string;
}
