import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import { normalizeUserFileDates } from "@/features/userFiles/utils/userFileDateNormalizers";
import { parseUtcDateTime } from "@/shared/utils/dateTime";

type NormalizableTask =
  | (Pick<ApprovalRequestTask | ApprovalRequestTaskListItem, "createdAt" | "completedAt"> & {
      createdAtDate?: Date;
      completedAtDate?: Date;
      taskFiles?: ApprovalRequestTask["taskFiles"];
    })
  | null
  | undefined;

type NormalizableApprovalRequest = Pick<ApprovalRequest, "createdAt" | "completedAt"> & {
  createdAtDate?: Date;
  completedAtDate?: Date;
  steps?: ApprovalRequest["steps"];
  requestFiles?: ApprovalRequest["requestFiles"];
};

export const normalizeApprovalRequestDates = (approvalRequest: NormalizableApprovalRequest): void => {
  approvalRequest.createdAtDate = parseUtcDateTime(approvalRequest.createdAt);
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
};

export const normalizeApprovalRequestTaskDates = (task: NormalizableTask): void => {
  if (!task) {
    return;
  }

  task.createdAtDate = parseUtcDateTime(task.createdAt);
  task.completedAtDate = task.completedAt ? parseUtcDateTime(task.completedAt) : undefined;
  task.taskFiles?.forEach((file, index, files) => {
    files[index] = normalizeUserFileDates(file);
  });
};
