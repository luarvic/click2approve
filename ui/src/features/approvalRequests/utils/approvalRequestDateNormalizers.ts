import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import { normalizeUserFileDates } from "@/features/userFiles/utils/userFileDateNormalizers";
import { parseUtcDateTime } from "@/shared/utils/dateTime";

type NormalizableTask =
  | (Pick<ApprovalRequestTask, "createdAt" | "completedAt"> & {
      createdAtDate?: Date;
      completedAtDate?: Date;
      taskFiles?: ApprovalRequestTask["taskFiles"];
    })
  | (Pick<ApprovalRequestTaskListItem, "createdAt"> & { createdAtDate?: Date })
  | null
  | undefined;

type NormalizableApprovalRequest =
  | (Pick<ApprovalRequest, "createdAt" | "completedAt"> & {
      createdAtDate?: Date;
      completedAtDate?: Date;
      steps?: ApprovalRequest["steps"];
      requestFiles?: ApprovalRequest["requestFiles"];
    })
  | (Pick<ApprovalRequestListItem, "createdAt"> & { createdAtDate?: Date });

export const normalizeApprovalRequestDates = (approvalRequest: NormalizableApprovalRequest): void => {
  approvalRequest.createdAtDate = parseUtcDateTime(approvalRequest.createdAt);
  if ("completedAt" in approvalRequest) {
    approvalRequest.completedAtDate = approvalRequest.completedAt
      ? parseUtcDateTime(approvalRequest.completedAt)
      : undefined;
    approvalRequest.steps?.forEach((step) => {
      step.tasks?.forEach(normalizeApprovalRequestTaskDates);
    });
    approvalRequest.requestFiles?.forEach((file) => {
      file.userFile = normalizeUserFileDates(file.userFile);
      if (file.previousUserFile) {
        file.previousUserFile = normalizeUserFileDates(file.previousUserFile);
      }
    });
  }
};

export const normalizeApprovalRequestTaskDates = (task: NormalizableTask): void => {
  if (!task) {
    return;
  }

  task.createdAtDate = parseUtcDateTime(task.createdAt);
  if ("completedAt" in task) {
    task.completedAtDate = task.completedAt ? parseUtcDateTime(task.completedAt) : undefined;
    task.taskFiles?.forEach((file, index, files) => {
      files[index] = normalizeUserFileDates(file);
    });
  }
};
