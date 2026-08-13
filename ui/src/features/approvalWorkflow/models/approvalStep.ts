import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";

export enum ApprovalStepMode {
  Any = 0,
  All = 1,
}

export enum ApprovalStepVisibilityMode {
  AllParticipants = 0,
  AllParticipantsExceptSelected = 1,
  AssigneesAndSelectedParticipants = 2,
  AssigneesOnly = 3,
}

export enum AssigneeType {
  User = 0,
  Employee = 1,
  Team = 2,
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
  isVisible?: boolean;
  assignees: ApprovalStepAssignee[];
  tasks?: ApprovalRequestTask[];
  visibility?: ApprovalStepVisibility[];
}

export interface ApprovalStepVisibility {
  assigneeGlobalId: string;
  assigneeType: AssigneeType;
  assigneeDisplayName?: string;
  assigneeEmail?: string;
  assigneeEmployeeGlobalId?: string;
  assigneeTeamGlobalId?: string;
  isVisible: boolean;
}
