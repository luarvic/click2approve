import { stores } from "@/app/rootStore";
import ApprovalRequestComment from "@/features/approvalRequests/components/ApprovalRequestComment";
import ApprovalRequestIdentityVerificationView from "@/features/approvalRequests/components/ApprovalRequestIdentityVerificationView";
import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import type { ApprovalRequestTimestampType } from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import {
  ApprovalStatusLineColors,
  getApprovalRequestTaskStatusLabel,
  getApprovalRequestTaskStatusLineColor,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestTaskLogEventType } from "@/features/approvalRequests/models/approvalRequestLogEntry";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { TenantType } from "@/features/tenants/models/tenant";
import DisplayName from "@/shared/components/identity/DisplayName";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import { Box, Stack } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestTaskSummaryBlockProps {
  icon?: ReactNode;
  onClick?: () => void;
  participant?: "approver" | "requester" | "none";
  showComment?: boolean;
  showFiles?: boolean;
  showIdentityVerification?: boolean;
  showRevision?: boolean;
  showTimeline?: boolean;
  showTitle?: boolean;
  task: ApprovalRequestTask;
  taskNumberPrefix?: string;
}

const clickableTaskSx: SxProps<Theme> = {
  cursor: "pointer",
  "&:focus-visible": {
    borderRadius: 1,
    outline: "2px solid",
    outlineColor: "success.main",
    outlineOffset: 2,
  },
};

const getTaskBoxSx = (
  status: ApprovalRequestTaskStatus,
  isClickable: boolean,
): SxProps<Theme> => {
  const lineColor = getApprovalRequestTaskStatusLineColor(status);

  return {
    ...Dialogs.approvalBoxSx,
    ...(isClickable ? clickableTaskSx : {}),
    borderLeft: "3px solid",
    borderLeftColor: lineColor === "other"
      ? "text.disabled"
      : ApprovalStatusLineColors[lineColor],
  };
};

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

const taskIdentityVerificationIsVisible = (task: ApprovalRequestTask) =>
  task.requiresIdentityVerification === true &&
  task.status !== ApprovalRequestTaskStatus.Pending;

const ApprovalRequestTaskSummaryBlock: React.FC<ApprovalRequestTaskSummaryBlockProps> = ({
  icon,
  onClick,
  participant = "requester",
  showComment = false,
  showFiles = true,
  showIdentityVerification = false,
  showRevision = true,
  showTimeline = true,
  showTitle = true,
  task,
  taskNumberPrefix,
}) => {
  const completedAt = getTaskCompletionDate(task);
  const isClickable = Boolean(onClick);
  const organizationIsVisible =
    stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const requestedByName = stripInlineEmail(task.requestedByDisplayName);
  const requestedByDisplayName = organizationIsVisible
    ? `${requestedByName} · ${task.createdByOrganizationDisplayName}`
    : requestedByName;
  const requestedByEmail = task.requestedByEmail ?? task.approvalRequest?.createdByEmail;
  const participantDisplayName = participant === "approver"
    ? task.approverDisplayName
    : requestedByDisplayName;
  const participantEmail = participant === "approver"
    ? task.approverEmail
    : requestedByEmail;
  const taskBoxSx = getTaskBoxSx(task.status, isClickable);

  return (
    <Box
      aria-label={getApprovalRequestTaskStatusLabel(task.status)}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable
        ? (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick?.();
          }
        }
        : undefined}
      role={isClickable ? "button" : undefined}
      sx={taskBoxSx}
      tabIndex={isClickable ? 0 : undefined}
    >
      <Stack spacing={StackSpacing.default}>
        <ApprovalRequestSummary
          title={task.title}
          description={task.description}
          approvalRequestTaskGlobalId={task.globalId}
          numberPrefix={taskNumberPrefix}
          requestFiles={task.requestFiles}
          revisionNumber={task.revisionNumber}
          showFileStateIndicators={false}
          showFiles={showFiles}
          showRevision={showRevision}
          showTitle={showTitle}
        />
        {participant !== "none" && (
          <ApprovalRequestParticipantLine
            icon={icon}
            label={(
              <DisplayName
                displayName={participantDisplayName}
                email={participantEmail}
              />
            )}
          />
        )}
        {showComment && <ApprovalRequestComment label="Comment" text={task.comment} />}
        {showIdentityVerification && taskIdentityVerificationIsVisible(task) && (
          <ApprovalRequestIdentityVerificationView task={task} />
        )}
        {showTimeline && (
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
        )}
      </Stack>
    </Box>
  );
};

export default ApprovalRequestTaskSummaryBlock;
