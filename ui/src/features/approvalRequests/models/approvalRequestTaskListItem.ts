import { ApprovalRequestTaskStatus } from "./approvalRequestTaskStatus";

export interface ApprovalRequestTaskListItem {
  id: number;
  title: string;
  status: ApprovalRequestTaskStatus;
  createdAt: string;
  createdAtDate: Date;
  requestedByDisplayName: string;
}
