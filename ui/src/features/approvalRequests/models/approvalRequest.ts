import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { UserFile } from "@/features/userFiles/models/userFile";
import { ApprovalRequestListItem } from "./approvalRequestListItem";
import { ApprovalRequestTask } from "./approvalRequestTask";

export interface ApprovalRequest extends ApprovalRequestListItem {
  userFiles: UserFile[];
  steps: ApprovalStep[];
  description?: string;
  createdByUserId: string;
  createdByEmail: string;
  tasks: ApprovalRequestTask[];
}

export interface SubmitApprovalRequestRequest {
  title: string;
  userFileIds: number[];
  steps: ApprovalStep[];
  description?: string;
}
