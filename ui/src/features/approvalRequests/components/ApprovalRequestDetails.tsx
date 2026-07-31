import ApprovalRequestSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import { Dialogs } from "@/shared/constants/constants";
import { Stack } from "@mui/material";

interface ApprovalRequestDetailsProps {
  approvalRequest: ApprovalRequest | null;
  showVisibleStepVisibility?: boolean;
}

const ApprovalRequestDetails: React.FC<ApprovalRequestDetailsProps> = ({
  approvalRequest,
  showVisibleStepVisibility = true,
}) => (
  <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
    {approvalRequest && (
      <ApprovalSteps
        approvalRequest={approvalRequest}
        leadingItem={<ApprovalRequestSummaryBlock approvalRequest={approvalRequest} />}
        showVisibleStepVisibility={showVisibleStepVisibility}
      />
    )}
  </Stack>
);

export default ApprovalRequestDetails;
