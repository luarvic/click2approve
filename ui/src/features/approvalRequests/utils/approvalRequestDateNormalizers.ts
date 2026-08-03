import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import { parseUtcDateTime } from "@/shared/utils/helpers";

type NormalizableTask =
  | Pick<ApprovalRequestTask | ApprovalRequestTaskListItem, "createdAt" | "completedAt"> & {
    createdAtDate?: Date;
    completedAtDate?: Date;
  }
  | null
  | undefined;

type NormalizableApprovalRequest =
  Pick<ApprovalRequest, "createdAt" | "completedAt"> & {
    createdAtDate?: Date;
    completedAtDate?: Date;
    steps?: ApprovalRequest["steps"];
  };

export const normalizeApprovalRequestDates = (
  approvalRequest: NormalizableApprovalRequest,
): void => {
  approvalRequest.createdAtDate = parseUtcDateTime(approvalRequest.createdAt);
  approvalRequest.completedAtDate = approvalRequest.completedAt
    ? parseUtcDateTime(approvalRequest.completedAt)
    : undefined;
  approvalRequest.steps?.forEach((step) => {
    step.tasks?.forEach(normalizeApprovalRequestTaskDates);
  });
};

export const normalizeApprovalRequestTaskDates = (
  task: NormalizableTask,
): void => {
  if (!task) {
    return;
  }

  task.createdAtDate = parseUtcDateTime(task.createdAt);
  task.completedAtDate = task.completedAt
    ? parseUtcDateTime(task.completedAt)
    : undefined;
};
