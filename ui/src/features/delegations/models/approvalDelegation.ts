export interface ApprovalDelegation {
  globalId: string;
  tenantGlobalId: string;
  delegatorEmployeeGlobalId: string;
  delegateEmployeeGlobalId: string;
  createdAt: string;
}

export interface ApprovalDelegationUpsert {
  delegatorEmployeeGlobalId: string;
  delegateEmployeeGlobalId: string;
}
