export interface ProductInfo {
  edition: string;
  requiresConfirmedEmail: boolean;
  capabilities: ProductCapabilities;
}

export interface ProductCapabilities {
  tenants: boolean;
  employeeApprovers: boolean;
  teamApprovers: boolean;
  approvalStepTemplates: boolean;
}
