import { ApprovalRequestTaskStatus } from "./approvalRequestTaskStatus";
import { ApprovalRequestTaskAction } from "./approvalRequestTaskAction";

export interface ApprovalRequestTaskListItem {
  globalId: string;
  title: string;
  action: ApprovalRequestTaskAction;
  status: ApprovalRequestTaskStatus;
  result?: boolean;
  createdAt: string;
  createdAtDate: Date;
  completedAt?: string;
  completedAtDate?: Date;
  requestedByEmail: string;
  requestedByDisplayName: string;
  organizationDisplayName: string;
  revisionNumber: number;
}
