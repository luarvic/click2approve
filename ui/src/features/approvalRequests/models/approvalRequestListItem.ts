import { ApprovalRequestStatus } from "./approvalRequestStatus";

export interface ApprovalRequestListItem {
  globalId: string;
  title: string;
  status: ApprovalRequestStatus;
  result?: boolean;
  createdAt: string;
  createdAtDate: Date;
  requesterDisplayName: string;
  revisionNumber: number;
}
