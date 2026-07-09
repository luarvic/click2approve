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
  canViewRequest: boolean;
}

export interface ApprovalStep {
  id?: number;
  sequence: number;
  mode: ApprovalStepMode;
  approvers: ApprovalStepApprover[];
  tasks?: ApprovalRequestTask[];
}
