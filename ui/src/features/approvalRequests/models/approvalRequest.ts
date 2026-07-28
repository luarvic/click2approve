import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { UserFile } from "@/features/userFiles/models/userFile";
import { ApprovalRequestListItem } from "./approvalRequestListItem";
import {
  ApprovalRequestLogEntry,
  ApprovalRequestTaskLogEntry,
} from "./approvalRequestLogEntry";
import { ApprovalRequestTask } from "./approvalRequestTask";

export interface ApprovalRequest extends ApprovalRequestListItem {
  requestFiles: ApprovalRequestFile[];
  steps: ApprovalStep[];
  description?: string;
  createdByUserId: string;
  createdByEmail: string;
  createdByDisplayName: string;
  previousRevisionApprovalRequestId?: number;
  previousRevisionApprovalRequestTitle?: string;
  nextRevisionApprovalRequestId?: number;
  nextRevisionApprovalRequestTitle?: string;
  tasks: ApprovalRequestTask[];
  logEntries: ApprovalRequestLogEntry[];
  taskLogEntries: ApprovalRequestTaskLogEntry[];
}

export enum ApprovalRequestFileRevisionAction {
  Unchanged = 0,
  Added = 1,
  Removed = 2,
  Replaced = 3,
}

export interface ApprovalRequestFile {
  id: number;
  userFile: UserFile;
  sequence: number;
  revisionAction: ApprovalRequestFileRevisionAction;
  previousApprovalRequestFileId?: number;
  previousUserFile?: UserFile;
}

export interface ApprovalRequestFileSubmission {
  userFileId: number;
  sequence: number;
  revisionAction: ApprovalRequestFileRevisionAction;
  previousApprovalRequestFileId?: number;
}

export interface ApprovalRequestStepVisibilitySubmission {
  stepSequence: number;
  approverStepSequence: number;
  approverIndex: number;
  isVisible: boolean;
}

export interface SubmitApprovalRequestRequest {
  title: string;
  previousRevisionApprovalRequestId?: number;
  requestFiles: ApprovalRequestFileSubmission[];
  steps: ApprovalStep[];
  stepVisibility: ApprovalRequestStepVisibilitySubmission[];
  description?: string;
}

export interface ResubmitApprovalRequestRequest {
  requestFiles: ApprovalRequestFileSubmission[];
  steps: ApprovalStep[];
  stepVisibility: ApprovalRequestStepVisibilitySubmission[];
  description?: string;
}
