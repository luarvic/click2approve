import { ApprovalRequestTaskStatus } from "./approvalRequestTaskStatus";

export interface ApprovalRequestTaskListItem {
  globalId: string;
  title: string;
  status: ApprovalRequestTaskStatus;
  createdAt: string;
  createdAtDate: Date;
  requestedByDisplayName: string;
  revisionNumber: number;
}
