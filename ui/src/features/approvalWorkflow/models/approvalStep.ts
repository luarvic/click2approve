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
  globalId?: string;
  type: ApprovalRecipientType;
  email?: string;
  employeeGlobalId?: string;
  teamGlobalId?: string;
  displayName?: string;
  requiresIdentityVerification?: boolean;
}

export interface ApprovalStep {
  globalId?: string;
  sequence: number;
  mode?: ApprovalStepMode;
  isVisible?: boolean;
  approvers: ApprovalStepApprover[];
  tasks?: ApprovalRequestTask[];
  visibility?: ApprovalStepVisibility[];
}

export interface ApprovalStepVisibility {
  approverGlobalId: string;
  approverType: ApprovalRecipientType;
  approverDisplayName?: string;
  approverEmail?: string;
  approverEmployeeGlobalId?: string;
  approverTeamGlobalId?: string;
  isVisible: boolean;
}
