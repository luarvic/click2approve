import { ApprovalRequestStatus } from "./approvalRequestStatus";

export interface ApprovalRequestListItem {
  globalId: string;
  title: string;
  status: ApprovalRequestStatus;
  result?: boolean;
  createdAt: string;
  createdAtDate: Date;
  createdByDisplayName: string;
  revisionNumber: number;
}
