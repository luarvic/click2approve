import { summaryCardContentSx } from "@/features/approvalRequests/components/approvalRequestSummaryStyles";
import ApprovalRequestCardLayout from "@/features/approvalRequests/components/ApprovalRequestCardLayout";
import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import ApprovalRequestFieldGroup from "@/features/approvalRequests/components/ApprovalRequestFieldGroup";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import { ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalUpcomingTaskBlockProps {
  assignee: ApprovalStepAssignee;
  compact?: boolean;
  defaultExpanded?: boolean;
  instructions?: string;
  title?: string;
}

const compactTaskCardContentSx: SxProps<Theme> = {
  py: 1,
  "&:last-child": {
    pb: 1,
  },
};

const ApprovalUpcomingTaskBlock: React.FC<ApprovalUpcomingTaskBlockProps> = ({
  assignee,
  compact = false,
  defaultExpanded,
  instructions,
  title = "Upcoming task",
}) => {
  const assigneeParticipant = (
    <ApprovalRequestParticipant
      displayName={assignee.displayName}
      email={assignee.email}
      type={assignee.type}
      variant="body2"
    />
  );

  return (
    <ApprovalRequestDetailsCard
      ariaLabel={title}
      contentSx={compact ? compactTaskCardContentSx : summaryCardContentSx}
      showStatusBorder={false}
    >
      <ApprovalRequestCardLayout
        activity={
          <ApprovalRequestFieldGroup title="Activity" valueVariant="body2">
            <ApprovalRequestField label="Assignee" value={assigneeParticipant} />
          </ApprovalRequestFieldGroup>
        }
        defaultExpanded={defaultExpanded}
        details={
          instructions?.trim() ? (
            <ApprovalRequestFieldGroup title="Details">
              <ApprovalRequestField label="Instructions" value={<UserProvidedText text={instructions} />} />
            </ApprovalRequestFieldGroup>
          ) : undefined
        }
        expandable
        title={title}
      />
    </ApprovalRequestDetailsCard>
  );
};

export default ApprovalUpcomingTaskBlock;
