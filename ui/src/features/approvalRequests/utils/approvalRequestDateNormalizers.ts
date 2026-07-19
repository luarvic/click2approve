import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import {
  ApprovalRequestLogEntry,
  ApprovalRequestTaskLogEntry,
} from "@/features/approvalRequests/models/approvalRequestLogEntry";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import { parseUtcDateTime } from "@/shared/utils/helpers";

type NormalizableLogEntry =
  | Pick<ApprovalRequestLogEntry | ApprovalRequestTaskLogEntry, "timestamp"> & {
    timestampDate?: Date;
  }
  | null
  | undefined;

type NormalizableTask =
  | Pick<ApprovalRequestTask | ApprovalRequestTaskListItem, "createdAt"> & {
    createdAtDate?: Date;
    logEntries?: ApprovalRequestTaskLogEntry[];
  }
  | null
  | undefined;

type NormalizableApprovalRequest =
  Pick<ApprovalRequest, "createdAt"> & {
    createdAtDate?: Date;
    tasks?: ApprovalRequest["tasks"];
    steps?: ApprovalRequest["steps"];
    logEntries?: ApprovalRequest["logEntries"];
    taskLogEntries?: ApprovalRequest["taskLogEntries"];
  };

export const normalizeApprovalRequestDates = (
  approvalRequest: NormalizableApprovalRequest,
): void => {
  approvalRequest.createdAtDate = parseUtcDateTime(approvalRequest.createdAt);
  approvalRequest.tasks?.forEach(normalizeApprovalRequestTaskDates);
  approvalRequest.steps?.forEach((step) => {
    step.tasks?.forEach(normalizeApprovalRequestTaskDates);
  });
  approvalRequest.logEntries?.forEach(normalizeApprovalRequestLogEntryDate);
  approvalRequest.taskLogEntries?.forEach(normalizeApprovalRequestLogEntryDate);
};

export const normalizeApprovalRequestTaskDates = (
  task: NormalizableTask,
): void => {
  if (!task) {
    return;
  }

  task.createdAtDate = parseUtcDateTime(task.createdAt);
  task.logEntries?.forEach(normalizeApprovalRequestLogEntryDate);
};

export const normalizeApprovalRequestLogEntryDate = (
  logEntry: NormalizableLogEntry,
): void => {
  if (!logEntry) {
    return;
  }

  logEntry.timestampDate = parseUtcDateTime(logEntry.timestamp);
};
