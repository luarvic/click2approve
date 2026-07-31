import { ApprovalRequestTaskStatus } from "./approvalRequestTaskStatus";

export interface ApprovalRequestTaskListItem {
  globalId: string;
  title: string;
  status: ApprovalRequestTaskStatus;
  createdAt: string;
  createdAtDate: Date;
  requestedByEmail: string;
  requestedByDisplayName: string;
  createdByOrganizationDisplayName: string;
  revisionNumber: number;
}
