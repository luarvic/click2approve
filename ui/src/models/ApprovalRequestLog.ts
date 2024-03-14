import { IApprovalRequest } from "./ApprovalRequest";
import { ApprovalRequestStatus } from "./ApprovalRequestStatus";

export interface IApprovalRequestLog {
  id: number;
  approvalRequest: IApprovalRequest;
  when: string;
  whenDate: Date;
  who: string;
  status: ApprovalRequestStatus;
  comment: string;
}
