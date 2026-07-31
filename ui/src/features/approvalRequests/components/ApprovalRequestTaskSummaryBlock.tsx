import { stores } from "@/app/rootStore";
import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import type { ApprovalRequestTimestampType } from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import {
  getApprovalRequestTaskStatusLabel,
  getApprovalRequestTaskStatusLineColor,
  getApprovalStatusBorderSx,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestTaskLogEventType } from "@/features/approvalRequests/models/approvalRequestLogEntry";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { TenantType } from "@/features/tenants/models/tenant";
import DisplayName from "@/shared/components/identity/DisplayName";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import { Box, Stack } from "@mui/material";

interface ApprovalRequestTaskSummaryBlockProps {
  task: ApprovalRequestTask;
}

const getTaskCompletionLabel = (task: ApprovalRequestTask) => {
  switch (task.status) {
    case ApprovalRequestTaskStatus.Approved:
      return "Approved at";
    case ApprovalRequestTaskStatus.Rejected:
      return "Rejected at";
    case ApprovalRequestTaskStatus.Skipped:
      return "Skipped at";
    case ApprovalRequestTaskStatus.Canceled:
      return "Canceled at";
    default:
      return "Completed at";
  }
};

const getTaskCompletionTimestampType = (
  task: ApprovalRequestTask,
): ApprovalRequestTimestampType => {
  switch (task.status) {
    case ApprovalRequestTaskStatus.Approved:
      return "approved";
    case ApprovalRequestTaskStatus.Rejected:
      return "rejected";
    case ApprovalRequestTaskStatus.Skipped:
      return "skipped";
    case ApprovalRequestTaskStatus.Canceled:
      return "canceled";
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
  const organizationIsVisible =
    stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const requestedByName = stripInlineEmail(task.requestedByDisplayName);
  const requestedByDisplayName = organizationIsVisible
    ? `${requestedByName} · ${task.createdByOrganizationDisplayName}`
    : requestedByName;
  const requestedByEmail = task.requestedByEmail ?? task.approvalRequest?.createdByEmail;

  return (
    <Box
      aria-label={getApprovalRequestTaskStatusLabel(task.status)}
      sx={getApprovalStatusBorderSx(
        getApprovalRequestTaskStatusLineColor(task.status),
        Dialogs.approvalBoxSx,
      )}
    >
      <Stack spacing={StackSpacing.default}>
        <ApprovalRequestSummary
          title={task.title}
          description={task.description}
          approvalRequestTaskGlobalId={task.globalId}
          requestFiles={task.requestFiles}
          revisionNumber={task.revisionNumber}
          showFileStateIndicators={false}
        />
        <ApprovalRequestParticipantLine
          label={(
            <DisplayName
              displayName={requestedByDisplayName}
              email={requestedByEmail}
            />
          )}
        />
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
                label: getTaskCompletionLabel(task),
                type: getTaskCompletionTimestampType(task),
              }
              : null,
          ]}
        />
      </Stack>
    </Box>
  );
};

export default ApprovalRequestTaskSummaryBlock;
