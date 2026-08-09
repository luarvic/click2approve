import { stores } from "@/app/rootStore";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import ApprovalRequestParticipantLabel from "@/features/approvalRequests/components/ApprovalRequestParticipantLabel";
import ApprovalRequestParticipantPair from "@/features/approvalRequests/components/ApprovalRequestParticipantPair";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalRequestTimestamp from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import { getRequestCompletedTimestamp } from "@/features/approvalRequests/components/approvalRequestCompletionTimestamps";
import {
  getApprovalRequestStatusLabel,
  getApprovalRequestStatusLineColor,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { getStatusBorderSx } from "@/shared/components/status/StatusLines";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { Box, Stack } from "@mui/material";

interface ApprovalRequestSummaryBlockProps {
  approvalRequest: ApprovalRequest;
  approvalRequestTaskGlobalId?: string;
}

const getRequestCompletionLabel = (status: ApprovalRequestStatus): string | undefined => {
  switch (status) {
    case ApprovalRequestStatus.Completed:
      return "Completed by";
    case ApprovalRequestStatus.Canceled:
      return "Canceled by";
    case ApprovalRequestStatus.Superseded:
      return "Resubmitted by";
    default:
      return undefined;
  }
};

const ApprovalRequestSummaryBlock: React.FC<ApprovalRequestSummaryBlockProps> = ({
  approvalRequest,
  approvalRequestTaskGlobalId,
}) => {
  const organizationIsVisible =
    stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const completionLabel = getRequestCompletionLabel(approvalRequest.status);
  const completedTimestamp = getRequestCompletedTimestamp(approvalRequest);
  const completedBySystem = approvalRequest.status === ApprovalRequestStatus.Completed
    && !approvalRequest.completedByDisplayName;
  const completionDisplayName = completedBySystem
    ? "System"
    : approvalRequest.completedByDisplayName ?? approvalRequest.createdByDisplayName;
  const completionEmail = completedBySystem
    ? undefined
    : approvalRequest.completedByEmail ?? approvalRequest.createdByEmail;

  return (
    <Box
      aria-label={getApprovalRequestStatusLabel(approvalRequest.status, approvalRequest.result)}
      sx={getStatusBorderSx(
        getApprovalRequestStatusLineColor(approvalRequest.status, approvalRequest.result),
        Dialogs.approvalBoxSx,
      )}
    >
      <Stack spacing={StackSpacing.default}>
        <ApprovalRequestSummary
          title={approvalRequest.title}
          description={approvalRequest.description}
          approvalRequestGlobalId={approvalRequest.globalId}
          approvalRequestTaskGlobalId={approvalRequestTaskGlobalId}
          nextRevisionApprovalRequestGlobalId={approvalRequestTaskGlobalId
            ? undefined
            : approvalRequest.nextRevisionApprovalRequestGlobalId}
          previousRevisionApprovalRequestGlobalId={approvalRequestTaskGlobalId
            ? undefined
            : approvalRequest.previousRevisionApprovalRequestGlobalId}
          requestFiles={approvalRequest.requestFiles}
          revisionNumber={approvalRequest.revisionNumber}
          tenantGlobalId={tenantGlobalId}
          compareFilesWithPrevious={(approvalRequest.revisionNumber ?? 1) > 1}
        />
        {completionLabel && completedTimestamp ? (
          <ApprovalRequestParticipantPair
            firstLabel={<ApprovalRequestParticipantLabel>Requested by</ApprovalRequestParticipantLabel>}
            firstParticipant={
              <ApprovalRequestParticipant
                displayName={approvalRequest.createdByDisplayName}
                email={approvalRequest.createdByEmail}
                organizationDisplayName={approvalRequest.organizationDisplayName}
                showOrganization={organizationIsVisible}
                type={AssigneeType.Employee}
              />
            }
            firstTimestamp={
              <ApprovalRequestTimestamp
                date={approvalRequest.createdAtDate}
                label="Requested at"
                type="created"
              />
            }
            secondLabel={<ApprovalRequestParticipantLabel>{completionLabel}</ApprovalRequestParticipantLabel>}
            secondParticipant={
              <ApprovalRequestParticipant
                displayName={completionDisplayName}
                email={completionEmail}
                isSystemParticipant={completedBySystem}
                organizationDisplayName={approvalRequest.organizationDisplayName}
                showOrganization={organizationIsVisible}
                type={AssigneeType.Employee}
              />
            }
            secondTimestamp={
              <ApprovalRequestTimestamp
                date={completedTimestamp.date}
                label={completedTimestamp.label}
                type={completedTimestamp.type}
              />
            }
          />
        ) : (
          <ApprovalRequestParticipantPair
            firstLabel={<ApprovalRequestParticipantLabel>Requested by</ApprovalRequestParticipantLabel>}
            firstParticipant={
              <ApprovalRequestParticipant
                displayName={approvalRequest.createdByDisplayName}
                email={approvalRequest.createdByEmail}
                organizationDisplayName={approvalRequest.organizationDisplayName}
                showOrganization={organizationIsVisible}
                type={AssigneeType.Employee}
              />
            }
            firstTimestamp={
              <ApprovalRequestTimestampRow
                items={[
                  {
                    date: approvalRequest.createdAtDate,
                    label: "Requested at",
                    type: "created",
                  },
                  completedTimestamp,
                ]}
              />
            }
          />
        )}
      </Stack>
    </Box>
  );
};

export default ApprovalRequestSummaryBlock;
