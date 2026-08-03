import { ApprovalRequestTimestampRowItem } from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";

const getCompletedTimestampType = (
  result?: boolean,
): ApprovalRequestTimestampRowItem["type"] =>
  result === false ? "completedUnsuccessfully" : "completedSuccessfully";

const getGenericCompletedTimestampLabel = (result?: boolean) =>
  result === false ? "Completed unsuccessfully at" : "Completed successfully at";

const getTaskCompletedTimestampLabel = (
  action: ApprovalRequestTaskAction,
  result?: boolean,
) => {
  if (result === false) {
    switch (action) {
      case ApprovalRequestTaskAction.Sign:
        return "Declined at";
      case ApprovalRequestTaskAction.Acknowledge:
        return "Disputed at";
      default:
        return "Rejected at";
    }
  }

  switch (action) {
    case ApprovalRequestTaskAction.Sign:
      return "Signed at";
    case ApprovalRequestTaskAction.Confirm:
      return "Confirmed at";
    case ApprovalRequestTaskAction.Acknowledge:
      return "Acknowledged at";
    default:
      return "Approved at";
  }
};

export const getRequestCompletedTimestamp = (
  approvalRequest: ApprovalRequest,
): ApprovalRequestTimestampRowItem | null => {
  if (!approvalRequest.completedAtDate) {
    return null;
  }

  switch (approvalRequest.status) {
    case ApprovalRequestStatus.Completed:
      return {
        date: approvalRequest.completedAtDate,
        label: getGenericCompletedTimestampLabel(approvalRequest.result),
        type: getCompletedTimestampType(approvalRequest.result),
      };
    case ApprovalRequestStatus.Canceled:
      return {
        date: approvalRequest.completedAtDate,
        label: "Canceled at",
        type: "canceled",
      };
    case ApprovalRequestStatus.Superseded:
      return {
        date: approvalRequest.completedAtDate,
        label: "Superseded at",
        type: "superseded",
      };
    default:
      return null;
  }
};

export const getTaskCompletedTimestamp = (
  task: ApprovalRequestTask,
): ApprovalRequestTimestampRowItem | null => {
  if (!task.completedAtDate) {
    return null;
  }

  switch (task.status) {
    case ApprovalRequestTaskStatus.Completed:
      return {
        date: task.completedAtDate,
        label: getTaskCompletedTimestampLabel(task.action, task.result),
        type: getCompletedTimestampType(task.result),
      };
    case ApprovalRequestTaskStatus.Skipped:
      return {
        date: task.completedAtDate,
        label: "Skipped at",
        type: "skipped",
      };
    case ApprovalRequestTaskStatus.Canceled:
      return {
        date: task.completedAtDate,
        label: "Canceled at",
        type: "canceled",
      };
    default:
      return null;
  }
};
