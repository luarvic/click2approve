import { IApprovalRequestTask } from "./approvalRequestTask";
import { ApprovalStatus } from "./approvalStatus";
import { IUserFile } from "./userFile";

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
