export interface ApplicationConfiguration {
  avatarImageSize: number;
  edition: string;
  logoImageSize: number;
  requiresConfirmedEmail: boolean;
  capabilities: ProductCapabilities;
}

export interface ProductCapabilities {
  apiTokens: boolean;
  tenants: boolean;
  discussions: boolean;
  discussionAttachments: boolean;
  employeeAssignees: boolean;
  teamAssignees: boolean;
  approvalStepTemplates: boolean;
  approvalRequestRevisions: boolean;
  receipts: boolean;
  subscriptions: boolean;
  taskAttachments: boolean;
}
