import { IApprovalRequestLog } from "./ApprovalRequestLog";
import { ApprovalRequestStatus } from "./ApprovalRequestStatus";
import { IApprover } from "./Approver";
import { IUserFile } from "./UserFile";

export interface IApprovalRequest {
  id: number;
  userFiles: IUserFile[];
  approvers: IApprover[];
  approveBy: string;
  approveByDate: Date;
  comment: string;
  created: string;
  createdDate: Date;
  author: string;
  status: ApprovalRequestStatus;
  logs: IApprovalRequestLog[];
}
