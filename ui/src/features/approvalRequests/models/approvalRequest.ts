import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { UserFile } from "@/features/userFiles/models/userFile";
import { ApprovalRequestListItem } from "./approvalRequestListItem";

export interface ApprovalRequest extends ApprovalRequestListItem {
  requestFiles: ApprovalRequestFile[];
  steps: ApprovalStep[];
  description?: string;
  createdByUserId: string;
  createdByEmail: string;
  createdByDisplayName: string;
  organizationDisplayName: string;
  previousRevisionApprovalRequestGlobalId?: string;
  previousRevisionApprovalRequestTitle?: string;
  nextRevisionApprovalRequestGlobalId?: string;
  nextRevisionApprovalRequestTitle?: string;
}

export enum ApprovalRequestFileRevisionAction {
  Unchanged = 0,
  Added = 1,
  Removed = 2,
  Replaced = 3,
}

export interface ApprovalRequestFile {
  globalId: string;
  userFile: UserFile;
  sequence: number;
  revisionAction: ApprovalRequestFileRevisionAction;
  previousApprovalRequestFileGlobalId?: string;
  previousUserFile?: UserFile;
}

export interface ApprovalRequestFileSubmission {
  userFileGlobalId: string;
  sequence: number;
  revisionAction: ApprovalRequestFileRevisionAction;
  previousApprovalRequestFileGlobalId?: string;
}

export interface ApprovalRequestStepVisibilitySubmission {
  stepSequence: number;
  approverStepSequence: number;
  approverIndex: number;
  isVisible: boolean;
}

export interface SubmitApprovalRequestRequest {
  title: string;
  previousRevisionApprovalRequestGlobalId?: string;
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
