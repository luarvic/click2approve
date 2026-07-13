export enum ApprovalRequestSharePermission {
  ReadOnly = 0,
  FullAccess = 1,
}

export interface ApprovalRequestShare {
  id: number;
  employeeId?: number;
  teamId?: number;
  permission: ApprovalRequestSharePermission;
}

export interface ApprovalRequestShareList {
  shares: ApprovalRequestShare[];
  canManage: boolean;
}

export interface UpsertApprovalRequestShare {
  employeeId?: number;
  teamId?: number;
  permission: ApprovalRequestSharePermission;
}
