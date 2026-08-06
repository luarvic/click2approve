import { stores } from "@/app/rootStore";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import { getRequestCompletedTimestamp } from "@/features/approvalRequests/components/approvalRequestCompletionTimestamps";
import {
  getApprovalRequestStatusLabel,
  getApprovalRequestStatusLineColor,
  getApprovalStatusBorderSx,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { Box, Stack } from "@mui/material";

interface ApprovalRequestSummaryBlockProps {
  approvalRequest: ApprovalRequest;
  approvalRequestTaskGlobalId?: string;
}

const ApprovalRequestSummaryBlock: React.FC<ApprovalRequestSummaryBlockProps> = ({
  approvalRequest,
  approvalRequestTaskGlobalId,
}) => {
  const organizationIsVisible =
    stores.tenantStore.currentTenant?.type === TenantType.Personal;

  return (
    <Box
      aria-label={getApprovalRequestStatusLabel(approvalRequest.status, approvalRequest.result)}
      sx={getApprovalStatusBorderSx(
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
          requestFiles={approvalRequest.requestFiles}
          revisionNumber={approvalRequest.revisionNumber}
          compareFilesWithPrevious={(approvalRequest.revisionNumber ?? 1) > 1}
        />
        <ApprovalRequestParticipant
          displayName={approvalRequest.createdByDisplayName}
          email={approvalRequest.createdByEmail}
          organizationDisplayName={approvalRequest.organizationDisplayName}
          showOrganization={organizationIsVisible}
          type={AssigneeType.Employee}
        />
        <ApprovalRequestTimestampRow
          items={[
            {
              date: approvalRequest.createdAtDate,
              label: "Created at",
              type: "created",
            },
            getRequestCompletedTimestamp(approvalRequest),
          ]}
        />
      </Stack>
    </Box>
  );
};

export default ApprovalRequestSummaryBlock;
