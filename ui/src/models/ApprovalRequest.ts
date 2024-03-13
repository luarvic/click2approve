import { ApprovalRequestStatuses } from "./ApprovalRequestStatuses";
import { IApprover } from "./Approver";
import { IUserFile } from "./UserFile";

export interface IApprovalRequest {
  id: number;
  userFiles: IUserFile[];
  approvers: IApprover[];
  approveBy: string;
  approveByDate: Date;
  comment: string;
  sent: string;
  sentDate: Date;
  author: string;
  status: ApprovalRequestStatuses;
}
