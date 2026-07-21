import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import {
  ApprovalLogActorType,
  ApprovalRequestLogEntry,
  ApprovalRequestLogEventType,
  ApprovalRequestTaskLogEntry,
  ApprovalRequestTaskLogEventType,
} from "@/features/approvalRequests/models/approvalRequestLogEntry";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import { Box, Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface ApprovalRequestLogProps {
  approvalRequest?: ApprovalRequest | null;
}

interface DisplayLogEntry {
  actor: string;
  actorType: string;
  details: string;
  event: string;
  id: string;
  onBehalfOf?: string;
  timestamp: Date;
}

const approvalRequestLogRecordsSx: SxProps<Theme> = {
  ...Dialogs.tabContentSx,
};

const approvalRequestLogRecordSx: SxProps<Theme> = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  p: 1.5,
};

const approvalRequestLogRecordLabelSx: SxProps<Theme> = {
  color: "text.secondary",
  flexShrink: 0,
  minWidth: "7rem",
};

const approvalRequestLogRecordValueSx: SxProps<Theme> = {
  minWidth: 0,
  overflowWrap: "anywhere",
};

const detailsRecordValueSx: SxProps<Theme> = { whiteSpace: "pre-wrap" };

const getActorTypeLabel = (actorType: ApprovalLogActorType) => {
  switch (actorType) {
    case ApprovalLogActorType.System:
      return "System";
    case ApprovalLogActorType.Employee:
      return "Employee";
    default:
      return "User";
  }
};

const getRequestEventLabel = (eventType: ApprovalRequestLogEventType) => {
  switch (eventType) {
    case ApprovalRequestLogEventType.Submitted:
      return "Request submitted";
    case ApprovalRequestLogEventType.StatusChanged:
      return "Request status changed";
    default:
      return "Request event";
  }
};

const getTaskEventLabel = (eventType: ApprovalRequestTaskLogEventType) => {
  switch (eventType) {
    case ApprovalRequestTaskLogEventType.Submitted:
      return "Task submitted";
    case ApprovalRequestTaskLogEventType.StatusChanged:
      return "Task status changed";
    default:
      return "Task event";
  }
};

const getRequestStatusLabel = (status?: ApprovalRequestStatus) => {
  switch (status) {
    case ApprovalRequestStatus.Approved:
      return "Approved";
    case ApprovalRequestStatus.Canceled:
      return "Canceled";
    case ApprovalRequestStatus.Pending:
      return "Pending";
    case ApprovalRequestStatus.Started:
      return "Started";
    case ApprovalRequestStatus.Rejected:
      return "Rejected";
    default:
      return "";
  }
};

const getTaskStatusLabel = (status?: ApprovalRequestTaskStatus) => {
  switch (status) {
    case ApprovalRequestTaskStatus.Approved:
      return "Approved";
    case ApprovalRequestTaskStatus.Pending:
      return "Pending";
    case ApprovalRequestTaskStatus.Rejected:
      return "Rejected";
    case ApprovalRequestTaskStatus.Skipped:
      return "Skipped";
    default:
      return "";
  }
};

const parseDetails = (details: string): Record<string, unknown> => {
  try {
    const value = JSON.parse(details);
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
};

const formatRequestDetails = (entry: ApprovalRequestLogEntry) => {
  const details = parseDetails(entry.details);
  switch (entry.eventType) {
    case ApprovalRequestLogEventType.Submitted:
      return `Status: ${getRequestStatusLabel(details.status as ApprovalRequestStatus | undefined)}`;
    case ApprovalRequestLogEventType.StatusChanged:
      return [
        `Previous status: ${getRequestStatusLabel(details.previousStatus as ApprovalRequestStatus | undefined) || "None"}`,
        `Status: ${getRequestStatusLabel(details.status as ApprovalRequestStatus | undefined)}`,
      ].join("\n");
    default:
      return entry.details;
  }
};

const formatTaskDetails = (entry: ApprovalRequestTaskLogEntry) => {
  const details = parseDetails(entry.details);
  if (entry.eventType === ApprovalRequestTaskLogEventType.Submitted) {
    return `Status: ${getTaskStatusLabel(details.status as ApprovalRequestTaskStatus | undefined)}`;
  }

  return [
    `Previous status: ${getTaskStatusLabel(details.previousStatus as ApprovalRequestTaskStatus | undefined) || "None"}`,
    `Status: ${getTaskStatusLabel(details.status as ApprovalRequestTaskStatus | undefined)}`,
    details.comment ? `Comment: ${details.comment}` : "",
  ].filter(Boolean).join("\n");
};

const mapRequestEntry = (entry: ApprovalRequestLogEntry): DisplayLogEntry => ({
  actor: entry.actorDisplayName,
  actorType: getActorTypeLabel(entry.actorType),
  details: formatRequestDetails(entry),
  event: getRequestEventLabel(entry.eventType),
  id: `request-${entry.id}`,
  timestamp: entry.timestampDate,
});

const mapTaskEntry = (entry: ApprovalRequestTaskLogEntry): DisplayLogEntry => ({
  actor: entry.actorDisplayName,
  actorType: getActorTypeLabel(entry.actorType),
  details: formatTaskDetails(entry),
  event: getTaskEventLabel(entry.eventType),
  id: `task-${entry.id}`,
  onBehalfOf: entry.onBehalfOfDisplayName,
  timestamp: entry.timestampDate,
});

const getLogEntries = (approvalRequest: ApprovalRequest): DisplayLogEntry[] => [
  ...(approvalRequest.logEntries ?? []).map(mapRequestEntry),
  ...(approvalRequest.taskLogEntries ?? []).map(mapTaskEntry),
].sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime());

const getRecordRows = (entry: DisplayLogEntry) => [
  { label: "Timestamp", value: getLocaleDateTimeString(entry.timestamp) },
  { label: "Event", value: entry.event },
  { label: "Actor type", value: entry.actorType },
  { label: "Actor", value: entry.actor },
  entry.onBehalfOf ? { label: "On behalf of", value: entry.onBehalfOf } : null,
  { label: "Details", value: entry.details },
].filter(Boolean) as { label: string; value: string }[];

const ApprovalRequestLog: React.FC<ApprovalRequestLogProps> = ({ approvalRequest }) => {
  if (!approvalRequest) {
    return null;
  }

  const entries = getLogEntries(approvalRequest);

  return (
    <Stack spacing={Dialogs.formStackSpacing} sx={approvalRequestLogRecordsSx}>
      {entries.map((entry) => (
        <Box key={entry.id} sx={approvalRequestLogRecordSx}>
          {getRecordRows(entry).map((row) => (
            <Stack key={row.label} direction="row" spacing={StackSpacing.default}>
              <Box component="span" sx={approvalRequestLogRecordLabelSx}>
                {row.label}
              </Box>
              <Box
                component="span"
                sx={
                  row.label === "Details"
                    ? [approvalRequestLogRecordValueSx, detailsRecordValueSx]
                    : approvalRequestLogRecordValueSx
                }
              >
                {row.value}
              </Box>
            </Stack>
          ))}
        </Box>
      ))}
    </Stack>
  );
};

export default ApprovalRequestLog;
