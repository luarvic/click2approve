import ApprovalRequestSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import { Dialogs } from "@/shared/constants/constants";
import { Stack } from "@mui/material";

interface ApprovalRequestDetailsProps {
  approvalRequest: ApprovalRequest | null;
}

const ApprovalRequestDetails: React.FC<ApprovalRequestDetailsProps> = ({
  approvalRequest,
}) => (
  <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
    {approvalRequest && (
      <ApprovalSteps
        approvalRequest={approvalRequest}
        leadingItem={<ApprovalRequestSummaryBlock approvalRequest={approvalRequest} />}
        showDividers
      />
    )}
  </Stack>
);

export default ApprovalRequestDetails;
