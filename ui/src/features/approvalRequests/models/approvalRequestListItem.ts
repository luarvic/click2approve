import { ApprovalRequestStatus } from "./approvalRequestStatus";

export interface ApprovalRequestListItem {
  id: number;
  title: string;
  status: ApprovalRequestStatus;
  createdAt: string;
  createdAtDate: Date;
  createdByDisplayName: string;
}
