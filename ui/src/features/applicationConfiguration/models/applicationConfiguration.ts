export interface ApplicationConfiguration {
  avatarImageSize: number;
  edition: string;
  logoImageSize: number;
  requiresConfirmedEmail: boolean;
  registrationLegal?: RegistrationLegal | null;
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

export interface RegistrationLegal {
  termsVersion: string;
  termsUrl: string;
  privacyVersion: string;
  privacyUrl: string;
}
