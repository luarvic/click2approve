import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";

export interface PublicReceipt {
  globalId: string;
  approvalRequestGlobalId: string;
  approvalRequestTitle: string;
  approvalRequestDescription?: string;
  approvalRequestStatus: ApprovalRequestStatus;
  approvalRequestResult?: boolean;
  revisionNumber: number;
  approvalRequestCreatedAt: Date;
  approvalRequestApprovedAt?: Date;
  approvalRequestCompletedByDisplayName?: string;
  createdByEmail: string;
  createdByDisplayName: string;
  organizationDisplayName: string;
  tenantGlobalId: string;
  tenantDisplayName: string;
  createdAt: Date;
  files: PublicReceiptFile[];
  participants: PublicReceiptParticipant[];
}

export interface PublicReceiptFile {
  globalId: string;
  userFileGlobalId: string;
  fileName: string;
  fileType: string;
  size: number;
  sequence: number;
  hashAlgorithm: string;
  hashValue: string;
}

export interface PublicReceiptParticipant {
  role: PublicReceiptParticipantRole;
  action: string;
  assignedAt?: Date;
  assigneeLegalName?: string;
  assigneeRepresentationDetails?: string;
  comment?: string;
  displayName: string;
  completedByDisplayName?: string;
  email: string;
  delegateDisplayName?: string;
  delegateEmail?: string;
  electronicSignatureJson?: string;
  files: PublicReceiptParticipantFile[];
  instructions?: string;
  organizationDisplayName?: string;
  completedAt?: Date;
  result?: boolean;
  taskGlobalId?: string;
  taskStatus?: ApprovalRequestTaskStatus;
}

export interface PublicReceiptParticipantFile extends PublicReceiptFile {}

export enum PublicReceiptParticipantRole {
  Requester,
  Assignee,
}
