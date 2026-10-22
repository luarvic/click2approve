import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";

export enum ApprovalStepMode {
  Any = "Any",
  All = "All",
}

export enum ApprovalStepVisibilityMode {
  AllParticipants = "AllParticipants",
  OrganizationEmployees = "OrganizationEmployees",
  AssigneesOnly = "AssigneesOnly",
}

export enum AssigneeType {
  User = "User",
  Employee = "Employee",
  Team = "Team",
}

export interface ApprovalStepAssignee {
  globalId?: string;
  type: AssigneeType;
  email?: string;
  userGlobalId?: string;
  employeeGlobalId?: string;
  teamGlobalId?: string;
  displayName?: string;
}

export interface ApprovalStep {
  globalId?: string;
  sequence: number;
  mode?: ApprovalStepMode;
  visibilityMode?: ApprovalStepVisibilityMode;
  action: ApprovalRequestTaskAction;
  instructions?: string;
  isAttachmentRequired?: boolean;
  isCommentRequired?: boolean;
  isElectronicSignatureRequired?: boolean;
  isVisible?: boolean;
  assignees: ApprovalStepAssignee[];
  tasks?: ApprovalRequestTask[];
}
