import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";

export enum ApprovalStepMode {
  Any = 0,
  All = 1,
}

export enum ApprovalRecipientType {
  Email = 0,
  Employee = 1,
  Team = 2,
}

export interface ApprovalStepApprover {
  id?: number;
  type: ApprovalRecipientType;
  email?: string;
  employeeId?: number;
  teamId?: number;
  displayName?: string;
}

export interface ApprovalStep {
  id?: number;
  sequence: number;
  mode?: ApprovalStepMode;
  isVisible?: boolean;
  approvers: ApprovalStepApprover[];
  tasks?: ApprovalRequestTask[];
  visibility?: ApprovalStepVisibility[];
}

export interface ApprovalStepVisibility {
  approverId: number;
  approverType: ApprovalRecipientType;
  approverDisplayName?: string;
  approverEmail?: string;
  approverEmployeeId?: number;
  approverTeamId?: number;
  isVisible: boolean;
}
