import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { UserFile } from "@/features/userFiles/models/userFile";
import { ApprovalRequestStatus } from "./approvalRequestStatus";
import { ApprovalRequestTask } from "./approvalRequestTask";

export interface ApprovalRequest {
  id: number;
  title: string;
  userFiles: UserFile[];
  steps: ApprovalStep[];
  description?: string;
  createdAt: string;
  createdAtDate: Date;
  completedAt?: string;
  completedAtDate?: Date;
  createdByUserId: string;
  createdByEmail: string;
  status: ApprovalRequestStatus;
  tasks: ApprovalRequestTask[];
}

export interface SubmitApprovalRequestRequest {
  title: string;
  userFileIds: number[];
  steps: ApprovalStep[];
  description?: string;
}
