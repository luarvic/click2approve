import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { UserFile } from "@/features/userFiles/models/userFile";
import { ApprovalRequestStatus } from "./approvalRequestStatus";
import { ApprovalRequestTask } from "./approvalRequestTask";

export interface ApprovalRequest {
  id: number;
  title: string;
  userFiles: UserFile[];
  steps: ApprovalStep[];
  approveBy?: string;
  approveByDate?: Date;
  comment?: string;
  createdAt: string;
  createdAtDate: Date;
  authorUserId: string;
  authorEmail: string;
  status: ApprovalRequestStatus;
  clonedFromApprovalRequestId?: number;
  tasks: ApprovalRequestTask[];
}

export interface SubmitApprovalRequestRequest {
  title: string;
  userFileIds: number[];
  steps: ApprovalStep[];
  approveBy: Date | null;
  comment?: string;
  clonedFromApprovalRequestId?: number;
}
