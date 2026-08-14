import ApprovalRequestSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import { Dialogs } from "@/shared/constants/constants";
import { Stack } from "@mui/material";

interface ApprovalRequestDetailsProps {
  approvalRequest: ApprovalRequest | null;
  approvalRequestTaskGlobalId?: string;
  highlightedTaskGlobalId?: string;
  onHighlightedTaskClick?: () => void;
  showVisibleStepVisibility?: boolean;
  taskAttachmentsTenantGlobalId?: string;
}

const ApprovalRequestDetails: React.FC<ApprovalRequestDetailsProps> = ({
  approvalRequest,
  approvalRequestTaskGlobalId,
  highlightedTaskGlobalId,
  onHighlightedTaskClick,
  showVisibleStepVisibility = true,
  taskAttachmentsTenantGlobalId,
}) => (
  <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
    {approvalRequest && (
      <ApprovalSteps
        approvalRequest={approvalRequest}
        highlightedTaskGlobalId={highlightedTaskGlobalId}
        leadingItem={
          <ApprovalRequestSummaryBlock
            approvalRequest={approvalRequest}
            approvalRequestTaskGlobalId={approvalRequestTaskGlobalId}
          />
        }
        onHighlightedTaskClick={onHighlightedTaskClick}
        showVisibleStepVisibility={showVisibleStepVisibility}
        taskAttachmentsTenantGlobalId={taskAttachmentsTenantGlobalId}
      />
    )}
  </Stack>
);

export default ApprovalRequestDetails;
