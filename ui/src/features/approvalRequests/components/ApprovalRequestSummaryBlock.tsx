import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import type { ApprovalRequestTimestampType } from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import { ApprovalRequestStatusLineSection } from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestLogEventType } from "@/features/approvalRequests/models/approvalRequestLogEntry";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { StackSpacing } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalRequestSummaryBlockProps {
  approvalRequest: ApprovalRequest;
}

const requestSummarySx: SxProps<Theme> = {
  minWidth: 0,
};

const finalRequestStatuses = new Set<ApprovalRequestStatus>([
  ApprovalRequestStatus.Approved,
  ApprovalRequestStatus.Rejected,
  ApprovalRequestStatus.Canceled,
]);

const parseStatusChangedDetails = (details: string) => {
  try {
    const value = JSON.parse(details);
    return value && typeof value === "object"
      ? value as { status?: ApprovalRequestStatus }
      : {};
  } catch {
    return {};
  }
};

interface FinalStatusChange {
  status: ApprovalRequestStatus;
  timestamp: Date;
}

const getFinalStatusChange = (approvalRequest: ApprovalRequest): FinalStatusChange | null =>
  (approvalRequest.logEntries ?? [])
    .filter((entry) => entry.eventType === ApprovalRequestLogEventType.StatusChanged)
    .map((entry) => ({
      status: parseStatusChangedDetails(entry.details).status as ApprovalRequestStatus,
      timestamp: entry.timestampDate,
    }))
    .filter((entry) => entry.timestamp && finalRequestStatuses.has(entry.status))
    .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())[0] ?? null;

const getFinalStatusLabel = (status: ApprovalRequestStatus) => {
  switch (status) {
    case ApprovalRequestStatus.Approved:
      return "Approved at";
    case ApprovalRequestStatus.Rejected:
      return "Rejected at";
    case ApprovalRequestStatus.Canceled:
      return "Canceled at";
    default:
      return "Completed at";
  }
};

const getFinalStatusTimestampType = (
  status: ApprovalRequestStatus,
): ApprovalRequestTimestampType => {
  switch (status) {
    case ApprovalRequestStatus.Approved:
      return "approved";
    case ApprovalRequestStatus.Rejected:
      return "rejected";
    case ApprovalRequestStatus.Canceled:
      return "canceled";
    default:
      return "completed";
  }
};

const ApprovalRequestSummaryBlock: React.FC<ApprovalRequestSummaryBlockProps> = ({
  approvalRequest,
}) => {
  const finalStatusChange = getFinalStatusChange(approvalRequest);

  return (
    <ApprovalRequestStatusLineSection
      status={approvalRequest.status}
      sx={requestSummarySx}
    >
      <Stack spacing={StackSpacing.tight}>
        <ApprovalRequestSummary
          title={approvalRequest.title}
          description={approvalRequest.description}
          approvalRequestId={approvalRequest.id}
          userFiles={approvalRequest.userFiles}
        />
        <ApprovalRequestParticipantLine label={approvalRequest.createdByDisplayName} />
        <ApprovalRequestTimestampRow
          items={[
            {
              date: approvalRequest.createdAtDate,
              label: "Created at",
              type: "created",
            },
            finalStatusChange
              ? {
                date: finalStatusChange.timestamp,
                label: getFinalStatusLabel(finalStatusChange.status),
                type: getFinalStatusTimestampType(finalStatusChange.status),
              }
              : null,
          ]}
        />
      </Stack>
    </ApprovalRequestStatusLineSection>
  );
};

export default ApprovalRequestSummaryBlock;
