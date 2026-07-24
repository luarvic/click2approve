import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import type { ApprovalRequestTimestampType } from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import { ApprovalRequestTaskLogEventType } from "@/features/approvalRequests/models/approvalRequestLogEntry";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { StackSpacing } from "@/shared/constants/constants";
import { Stack } from "@mui/material";

interface ApprovalRequestTaskSummaryBlockProps {
  task: ApprovalRequestTask;
}

const getTaskCompletionLabel = (status: ApprovalRequestTaskStatus) => {
  switch (status) {
    case ApprovalRequestTaskStatus.Approved:
      return "Approved at";
    case ApprovalRequestTaskStatus.Rejected:
      return "Rejected at";
    case ApprovalRequestTaskStatus.Skipped:
      return "Skipped at";
    default:
      return "Completed at";
  }
};

const getTaskCompletionTimestampType = (
  status: ApprovalRequestTaskStatus,
): ApprovalRequestTimestampType => {
  switch (status) {
    case ApprovalRequestTaskStatus.Approved:
      return "approved";
    case ApprovalRequestTaskStatus.Rejected:
      return "rejected";
    case ApprovalRequestTaskStatus.Skipped:
      return "skipped";
    default:
      return "completed";
  }
};

const getTaskCompletionDate = (task: ApprovalRequestTask) => {
  if (task.status === ApprovalRequestTaskStatus.Pending) {
    return null;
  }

  return (task.logEntries ?? [])
    .filter((entry) => entry.eventType === ApprovalRequestTaskLogEventType.StatusChanged)
    .map((entry) => entry.timestampDate)
    .filter(Boolean)
    .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;
};

const ApprovalRequestTaskSummaryBlock: React.FC<ApprovalRequestTaskSummaryBlockProps> = ({
  task,
}) => {
  const completedAt = getTaskCompletionDate(task);

  return (
    <Stack spacing={StackSpacing.tight}>
      <ApprovalRequestSummary
        title={task.title}
        description={task.description}
        approvalRequestTaskId={task.id}
        userFiles={task.userFiles}
      />
      <ApprovalRequestParticipantLine label={task.requestedByDisplayName} />
      <ApprovalRequestTimestampRow
        items={[
          {
            date: task.createdAtDate,
            label: "Created at",
            type: "created",
          },
          completedAt
            ? {
              date: completedAt,
              label: getTaskCompletionLabel(task.status),
              type: getTaskCompletionTimestampType(task.status),
            }
            : null,
        ]}
      />
    </Stack>
  );
};

export default ApprovalRequestTaskSummaryBlock;
