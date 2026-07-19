export interface ApprovalDelegation {
  id: number;
  tenantId: number;
  delegatorEmployeeId: number;
  delegateEmployeeId: number;
  createdAt: string;
}

export interface ApprovalDelegationUpsert {
  delegatorEmployeeId: number;
  delegateEmployeeId: number;
}
