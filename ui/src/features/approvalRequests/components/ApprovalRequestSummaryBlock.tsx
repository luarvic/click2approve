import { stores } from "@/app/rootStore";
import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalRequestTimestampRow from "@/features/approvalRequests/components/ApprovalRequestTimestampRow";
import {
  getApprovalRequestStatusLabel,
  getApprovalRequestStatusLineColor,
  getApprovalStatusBorderSx,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { TenantType } from "@/features/tenants/models/tenant";
import DisplayName from "@/shared/components/identity/DisplayName";
import { Dialogs, StackSpacing } from "@/shared/constants/constants";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import { Box, Stack } from "@mui/material";

interface ApprovalRequestSummaryBlockProps {
  approvalRequest: ApprovalRequest;
}

const ApprovalRequestSummaryBlock: React.FC<ApprovalRequestSummaryBlockProps> = ({
  approvalRequest,
}) => {
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
          ]}
        />
      </Stack>
    </Box>
  );
};

export default ApprovalRequestSummaryBlock;
