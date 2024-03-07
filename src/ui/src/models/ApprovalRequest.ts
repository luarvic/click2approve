import { IApprover } from "./Approver";
import { IUserFile } from "./UserFile";

export interface IApprovalRequest {
  id: string;
  userFiles: IUserFile[];
  approvers: IApprover[];
  approveBy: string;
  approveByDate: Date;
  comment: string;
  sent: string;
  sentDate: Date;
  author: string;
}
