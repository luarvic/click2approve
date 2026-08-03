import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";

export interface SharedVerificationLinkListItem {
  globalId: string;
  approvalRequestGlobalId: string;
  approvalRequestTitle: string;
  createdAt: Date;
  createdByEmail: string;
}

export interface SharedVerificationReceipt {
  globalId: string;
  approvalRequestGlobalId: string;
  approvalRequestTitle: string;
  approvalRequestStatus: ApprovalRequestStatus;
  revisionNumber: number;
  approvalRequestCreatedAt: Date;
  approvalRequestApprovedAt?: Date;
  createdByEmail: string;
  createdByDisplayName: string;
  createdByOrganizationDisplayName: string;
  tenantGlobalId: string;
  tenantDisplayName: string;
  createdAt: Date;
  files: SharedVerificationFile[];
}

export interface SharedVerificationFile {
  globalId: string;
  userFileGlobalId: string;
  fileName: string;
  fileType: string;
  size: number;
  sequence: number;
  hashAlgorithm: string;
  hashValue: string;
}
