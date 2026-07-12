export interface ProductInfo {
  edition: string;
  capabilities: ProductCapabilities;
}

export interface ProductCapabilities {
  tenants: boolean;
  employeeApprovers: boolean;
  teamApprovers: boolean;
  approvalStepTemplates: boolean;
  approvalRequestSharing: boolean;
}
