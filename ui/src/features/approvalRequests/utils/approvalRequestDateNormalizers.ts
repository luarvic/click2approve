import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import { parseUtcDateTime } from "@/shared/utils/helpers";

type NormalizableTask =
  | Pick<ApprovalRequestTask | ApprovalRequestTaskListItem, "createdAt"> & {
    createdAtDate?: Date;
  }
  | null
  | undefined;

type NormalizableApprovalRequest =
  Pick<ApprovalRequest, "createdAt"> & {
    createdAtDate?: Date;
    steps?: ApprovalRequest["steps"];
  };

export const normalizeApprovalRequestDates = (
  approvalRequest: NormalizableApprovalRequest,
): void => {
  approvalRequest.createdAtDate = parseUtcDateTime(approvalRequest.createdAt);
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
};
