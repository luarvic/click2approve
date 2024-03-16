import { IApprovalRequestTask } from "./ApprovalRequestTask";
import { ApprovalStatus } from "./ApprovalStatus";
import { IUserFile } from "./UserFile";

export interface IApprovalRequest {
  id: number;
  userFiles: IUserFile[];
  approvers: string[];
  approveBy?: string;
  approveByDate?: Date;
  comment?: string;
  submitted: string;
  submittedDate: Date;
  author: string;
  status: ApprovalStatus;
  tasks: IApprovalRequestTask[];
}
