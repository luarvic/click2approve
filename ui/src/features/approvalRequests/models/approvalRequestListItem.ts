import { ApprovalRequestStatus } from "./approvalRequestStatus";

export interface ApprovalRequestListItem {
  globalId: string;
  title: string;
  status: ApprovalRequestStatus;
  result?: boolean;
  createdAt: string;
  createdAtDate: Date;
  completedAt?: string;
  completedAtDate?: Date;
  createdByEmail: string;
  createdByDisplayName: string;
  createdByOrganizationDisplayName: string;
  revisionNumber: number;
}
