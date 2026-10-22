import ApprovalRequestSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import ApprovalSteps from "@/features/approvalWorkflow/components/ApprovalSteps";
import { Forms } from "@/shared/components/dialogs/formStyles";

interface ApprovalRequestDetailsProps {
  approvalRequest: ApprovalRequest | null;
  approvalRequestTaskGlobalId?: string;
  collapseCards?: boolean;
  highlightedTaskGlobalId?: string;
  onHighlightedTaskClick?: () => void;
  showVisibleStepVisibility?: boolean;
  taskAttachmentsTenantGlobalId?: string;
}

const ApprovalRequestDetails: React.FC<ApprovalRequestDetailsProps> = ({
  approvalRequest,
  approvalRequestTaskGlobalId,
  collapseCards = false,
  highlightedTaskGlobalId,
  onHighlightedTaskClick,
  showVisibleStepVisibility = true,
  taskAttachmentsTenantGlobalId,
}) =>
  approvalRequest ? (
    <ApprovalSteps
      approvalRequest={approvalRequest}
      collapseCards={collapseCards}
      highlightedTaskGlobalId={highlightedTaskGlobalId}
      leadingItem={
        <ApprovalRequestSummaryBlock
          approvalRequest={approvalRequest}
          approvalRequestTaskGlobalId={approvalRequestTaskGlobalId}
          defaultExpanded={!collapseCards}
          expandable
          limitWorkflowFields={Boolean(approvalRequestTaskGlobalId)}
        />
      }
      onHighlightedTaskClick={onHighlightedTaskClick}
      limitWorkflowFields
      showVisibleStepVisibility={showVisibleStepVisibility}
      sx={Forms.tabContentSx}
      taskAttachmentsTenantGlobalId={taskAttachmentsTenantGlobalId}
    />
  ) : null;

export default ApprovalRequestDetails;
