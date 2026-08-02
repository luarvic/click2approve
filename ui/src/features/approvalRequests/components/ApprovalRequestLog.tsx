import { stores } from "@/app/rootStore";
import { getApprovalRequestNumber } from "@/features/approvalRequests/components/ApprovalRequestNumberText";
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
import { TenantType } from "@/features/tenants/models/tenant";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { normalizeEmailForDisplay } from "@/shared/utils/displayNameHelpers";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import { Box, Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface ApprovalRequestLogProps {
  approvalRequest?: ApprovalRequest | null;
}

interface DisplayLogEntry {
  actor: string;
  actorEmail: string;
  actorType: string;
  details: string;
  event: string;
  id: string;
  onBehalfOf?: string;
  onBehalfOfEmail?: string;
  organization: string;
  sameTimestampOrder: number;
  subject: string;
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
    case ApprovalRequestStatus.Superseded:
      return "Superseded";
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
    case ApprovalRequestTaskStatus.Canceled:
      return "Canceled";
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
    details.legalFirstName || details.legalLastName
      ? `Legal name: ${[details.legalFirstName, details.legalLastName].filter(Boolean).join(" ")}`
      : "",
    details.dateOfBirth ? `Date of birth: ${details.dateOfBirth}` : "",
    details.signatureCaptured === true ? "Signature: Captured" : "",
    details.ipAddress ? `IP address: ${details.ipAddress}` : "",
    details.browserData ? `Browser data: ${details.browserData}` : "",
  ].filter(Boolean).join("\n");
};

const formatSubject = (type: "Approval request" | "Task", globalId: string, title: string) =>
  `${type} ${getApprovalRequestNumber(globalId)}: ${title}`;

const getRequestSameTimestampOrder = (entry: ApprovalRequestLogEntry) => {
  if (entry.eventType === ApprovalRequestLogEventType.Submitted) {
    return 0;
  }

  const details = parseDetails(entry.details);
  const status = details.status as ApprovalRequestStatus | undefined;
  if (status === ApprovalRequestStatus.Canceled) {
    return 1;
  }

  return 3;
};

const getTaskSameTimestampOrder = (entry: ApprovalRequestTaskLogEntry) => {
  if (entry.eventType === ApprovalRequestTaskLogEventType.Submitted) {
    return 1;
  }

  const details = parseDetails(entry.details);
  const status = details.status as ApprovalRequestTaskStatus | undefined;
  if (
    status === ApprovalRequestTaskStatus.Canceled
    || status === ApprovalRequestTaskStatus.Skipped
  ) {
    return 4;
  }

  return 2;
};

const mapRequestEntry = (
  entry: ApprovalRequestLogEntry,
  approvalRequest: ApprovalRequest,
  organization: string,
): DisplayLogEntry => ({
  actor: entry.actorDisplayName,
  actorEmail: entry.actorEmail,
  actorType: getActorTypeLabel(entry.actorType),
  details: formatRequestDetails(entry),
  event: getRequestEventLabel(entry.eventType),
  id: `request-${entry.globalId}`,
  organization,
  sameTimestampOrder: getRequestSameTimestampOrder(entry),
  subject: formatSubject("Approval request", approvalRequest.globalId, approvalRequest.title),
  timestamp: entry.timestampDate,
});

const mapTaskEntry = (
  entry: ApprovalRequestTaskLogEntry,
  taskSubjects: Map<string, string>,
  organization: string,
): DisplayLogEntry => ({
  actor: entry.actorDisplayName,
  actorEmail: entry.actorEmail,
  actorType: getActorTypeLabel(entry.actorType),
  details: formatTaskDetails(entry),
  event: getTaskEventLabel(entry.eventType),
  id: `task-${entry.globalId}`,
  onBehalfOf: entry.onBehalfOfDisplayName,
  onBehalfOfEmail: entry.onBehalfOfEmail,
  organization,
  sameTimestampOrder: getTaskSameTimestampOrder(entry),
  subject: taskSubjects.get(entry.approvalRequestTaskGlobalId)
    ?? formatSubject("Task", entry.approvalRequestTaskGlobalId, "Unknown task"),
  timestamp: entry.timestampDate,
});

const getVisibleTaskIds = (approvalRequest: ApprovalRequest) => {
  const steps = approvalRequest.steps ?? [];
  if (!steps.some((step) => step.isVisible === false)) {
    return null;
  }

  const visibleTaskGlobalIds = new Set<string>();
  steps
    .filter((step) => step.isVisible !== false)
    .flatMap((step) => step.tasks ?? [])
    .forEach((task) => visibleTaskGlobalIds.add(task.globalId));

  return visibleTaskGlobalIds;
};

const getTaskSubjects = (approvalRequest: ApprovalRequest) => new Map(
  (approvalRequest.steps ?? [])
    .flatMap((step) => step.tasks ?? [])
    .map((task) => [
      task.globalId,
      formatSubject("Task", task.globalId, task.title),
    ]),
);

const getLogEntries = (approvalRequest: ApprovalRequest): DisplayLogEntry[] => {
  const visibleTaskGlobalIds = getVisibleTaskIds(approvalRequest);
  const taskSubjects = getTaskSubjects(approvalRequest);
  const taskLogEntries = visibleTaskGlobalIds
    ? (approvalRequest.taskLogEntries ?? []).filter((entry) =>
        visibleTaskGlobalIds.has(entry.approvalRequestTaskGlobalId),
      )
    : (approvalRequest.taskLogEntries ?? []);

  return [
    ...(approvalRequest.logEntries ?? []).map((entry) =>
      mapRequestEntry(entry, approvalRequest, approvalRequest.createdByOrganizationDisplayName),
    ),
    ...taskLogEntries.map((entry) =>
      mapTaskEntry(entry, taskSubjects, approvalRequest.createdByOrganizationDisplayName),
    ),
  ].sort((left, right) =>
    left.timestamp.getTime() - right.timestamp.getTime()
      || left.sameTimestampOrder - right.sameTimestampOrder
      || left.id.localeCompare(right.id));
};

const trimInlineEmail = (displayName: string) =>
  displayName.replace(/\s+\([^()\s]+@[^()\s]+\)\s*$/, "").trim();

const formatLogDisplayName = (displayName?: string | null, email?: string | null) => {
  const normalizedEmail = normalizeEmailForDisplay(email ?? undefined);
  const primary = trimInlineEmail(displayName?.trim() || normalizedEmail);
  return normalizedEmail && normalizeEmailForDisplay(primary) !== normalizedEmail
    ? `${primary} (${normalizedEmail})`
    : primary;
};

const getRecordRows = (entry: DisplayLogEntry, organizationIsVisible: boolean) => [
  { label: "Timestamp", value: getLocaleDateTimeString(entry.timestamp) },
  { label: "Subject", value: entry.subject },
  { label: "Event", value: entry.event },
  { label: "Actor type", value: entry.actorType },
  { label: "Actor", value: formatLogDisplayName(entry.actor, entry.actorEmail) },
  entry.onBehalfOf ? {
    label: "On behalf of",
    value: formatLogDisplayName(entry.onBehalfOf, entry.onBehalfOfEmail),
  } : null,
  organizationIsVisible ? { label: "Organization", value: entry.organization } : null,
  { label: "Details", value: entry.details },
].filter(Boolean) as { label: string; value: string }[];

const ApprovalRequestLog: React.FC<ApprovalRequestLogProps> = ({ approvalRequest }) => {
  if (!approvalRequest) {
    return null;
  }

  const entries = getLogEntries(approvalRequest);
  const organizationIsVisible =
    stores.tenantStore.currentTenant?.type === TenantType.Personal;

  return (
    <Stack spacing={Dialogs.formStackSpacing} sx={approvalRequestLogRecordsSx}>
      {entries.map((entry) => (
        <Box key={entry.id} sx={approvalRequestLogRecordSx}>
          {getRecordRows(entry, organizationIsVisible).map((row) => (
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
