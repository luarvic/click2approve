export interface ApplicationConfiguration {
  avatarImageSize: number;
  edition: string;
  logoImageSize: number;
  requiresConfirmedEmail: boolean;
  capabilities: ProductCapabilities;
}

export interface ProductCapabilities {
  tenants: boolean;
  discussions: boolean;
  discussionAttachments: boolean;
  employeeAssignees: boolean;
  teamAssignees: boolean;
  approvalStepTemplates: boolean;
  approvalRequestRevisions: boolean;
  receipts: boolean;
  taskAttachments: boolean;
}
