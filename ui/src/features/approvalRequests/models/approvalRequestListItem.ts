import { ApprovalRequestStatus } from "./approvalRequestStatus";

export interface ApprovalRequestListItem {
  globalId: string;
  title: string;
  status: ApprovalRequestStatus;
  createdAt: string;
  createdAtDate: Date;
  createdByEmail: string;
  createdByDisplayName: string;
  createdByOrganizationDisplayName: string;
  revisionNumber: number;
}
