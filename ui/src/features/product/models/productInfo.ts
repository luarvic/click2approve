export interface ProductInfo {
  edition: string;
  requiresConfirmedEmail: boolean;
  capabilities: ProductCapabilities;
}

export interface ProductCapabilities {
  tenants: boolean;
  employeeAssignees: boolean;
  teamAssignees: boolean;
  approvalStepTemplates: boolean;
  approvalRequestRevisions: boolean;
  sharedVerificationLinks: boolean;
}
