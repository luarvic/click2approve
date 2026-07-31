import { stores } from "@/app/rootStore";
import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import type { ApprovalRequestTimestampType } from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import {
  getApprovalRequestStatusLabel,
  getApprovalRequestStatusLineColor,
  getApprovalStatusBorderSx,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestLogEventType } from "@/features/approvalRequests/models/approvalRequestLogEntry";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { TenantType } from "@/features/tenants/models/tenant";
import DisplayName from "@/shared/components/identity/DisplayName";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import { Box, Stack } from "@mui/material";

interface ApprovalRequestSummaryBlockProps {
  approvalRequest: ApprovalRequest;
}

const finalRequestStatuses = new Set<ApprovalRequestStatus>([
  ApprovalRequestStatus.Approved,
  ApprovalRequestStatus.Rejected,
  ApprovalRequestStatus.Canceled,
  ApprovalRequestStatus.Superseded,
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
    case ApprovalRequestStatus.Superseded:
      return "Superseded at";
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
    case ApprovalRequestStatus.Superseded:
      return "superseded";
    default:
      return "completed";
  }
};

const ApprovalRequestSummaryBlock: React.FC<ApprovalRequestSummaryBlockProps> = ({
  approvalRequest,
}) => {
  const finalStatusChange = getFinalStatusChange(approvalRequest);
  const organizationIsVisible =
    stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const createdByName = stripInlineEmail(approvalRequest.createdByDisplayName);
  const createdByDisplayName = organizationIsVisible
    ? `${createdByName} · ${approvalRequest.createdByOrganizationDisplayName}`
    : createdByName;

  return (
    <Box
      aria-label={getApprovalRequestStatusLabel(approvalRequest.status)}
      sx={getApprovalStatusBorderSx(
        getApprovalRequestStatusLineColor(approvalRequest.status),
        Dialogs.approvalBoxSx,
      )}
    >
      <Stack spacing={StackSpacing.default}>
        <ApprovalRequestSummary
          title={approvalRequest.title}
          description={approvalRequest.description}
          approvalRequestGlobalId={approvalRequest.globalId}
          requestFiles={approvalRequest.requestFiles}
          revisionNumber={approvalRequest.revisionNumber}
          compareFilesWithPrevious={(approvalRequest.revisionNumber ?? 1) > 1}
        />
        <ApprovalRequestParticipantLine
          label={(
            <DisplayName
              displayName={createdByDisplayName}
              email={approvalRequest.createdByEmail}
            />
          )}
        />
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
    </Box>
  );
};

export default ApprovalRequestSummaryBlock;
