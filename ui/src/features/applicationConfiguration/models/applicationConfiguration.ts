export interface ApplicationConfiguration {
  avatarImageSize: number;
  edition: string;
  logoImageSize: number;
  requiresConfirmedEmail: boolean;
  registrationLegal?: RegistrationLegal | null;
  siteLinks?: SiteLinks;
  capabilities: ProductCapabilities;
}

export interface SiteLinks {
  termsUrl?: string | null;
  privacyUrl?: string | null;
}

export interface ProductCapabilities {
  apiTokens: boolean;
  tenants: boolean;
  discussions: boolean;
  discussionAttachments: boolean;
  employeeAssignees: boolean;
  teamAssignees: boolean;
  guestApprovals?: boolean;
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
