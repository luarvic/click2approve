import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";

export interface Receipt {
  globalId: string;
  approvalRequestGlobalId: string;
  approvalRequestTitle: string;
  approvalRequestDescription?: string;
  approvalRequestStatus: ApprovalRequestStatus;
  approvalRequestResult?: boolean;
  revisionNumber: number;
  approvalRequestCreatedAt: Date;
  approvalRequestCompletedAt?: Date;
  approvalRequestCompletedByDisplayName?: string;
  createdByEmail: string;
  createdByDisplayName: string;
  organizationDisplayName: string;
  tenantGlobalId: string;
  tenantDisplayName: string;
  createdAt: Date;
  links: ReceiptLink[];
  files: ReceiptFile[];
  participants: ReceiptParticipant[];
}

export interface ReceiptFile {
  globalId: string;
  userFileGlobalId: string;
  fileName: string;
  fileType: string;
  size: number;
  sequence: number;
  hashAlgorithm: string;
  hashValue: string;
}

export interface ReceiptParticipant {
  role: ReceiptParticipantRole;
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
  files: ReceiptParticipantFile[];
  instructions?: string;
  organizationDisplayName?: string;
  completedAt?: Date;
  result?: boolean;
  taskGlobalId?: string;
  taskStatus?: ApprovalRequestTaskStatus;
}

export interface ReceiptParticipantFile extends ReceiptFile {}

export enum ReceiptParticipantRole {
  Requester,
  Assignee,
}

export interface ReceiptLink {
  globalId: string;
  createdAt: Date;
}
