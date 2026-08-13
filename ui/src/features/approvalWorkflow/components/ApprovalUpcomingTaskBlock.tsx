import ApprovalRequestContentGroups from "@/features/approvalRequests/components/ApprovalRequestContentGroups";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import ApprovalRequestParticipantLabel from "@/features/approvalRequests/components/ApprovalRequestParticipantLabel";
import ApprovalRequestParticipantPair from "@/features/approvalRequests/components/ApprovalRequestParticipantPair";
import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import {
  getApprovalRequestTimestampIcon,
} from "@/features/approvalRequests/components/approvalRequestTimestampDisplay";
import { ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import TimelineTimestamp from "@/shared/components/timeline/TimelineTimestamp";
import { Typography } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalUpcomingTaskBlockProps {
  assignee: ApprovalStepAssignee;
  compact?: boolean;
  showAssigneeLabel?: boolean;
  showStatusBorder?: boolean;
  showTitle?: boolean;
  showTimeline?: boolean;
  title?: string;
}

const upcomingTaskTitleSx: SxProps<Theme> = {
  color: "text.secondary",
};
const compactTaskCardContentSx: SxProps<Theme> = {
  py: 1,
  "&:last-child": {
    pb: 1,
  },
};

const ApprovalUpcomingTaskBlock: React.FC<ApprovalUpcomingTaskBlockProps> = ({
  assignee,
  compact = false,
  showAssigneeLabel = true,
  showStatusBorder = true,
  showTitle = true,
  showTimeline = true,
  title = "Upcoming task",
}) => (
  <ApprovalRequestDetailsCard
    ariaLabel={title}
    borderLeftColor="text.disabled"
    contentSx={compact ? compactTaskCardContentSx : undefined}
    showStatusBorder={showStatusBorder}
  >
    <ApprovalRequestContentGroups
      header={showTitle ? (
        <Typography component="h2" sx={upcomingTaskTitleSx} variant="subtitle1">
          {title}
        </Typography>
      ) : undefined}
      metadata={
        <ApprovalRequestParticipantPair
          firstLabel={showAssigneeLabel ? (
            <ApprovalRequestParticipantLabel>Assignee</ApprovalRequestParticipantLabel>
          ) : undefined}
          firstParticipant={(
            <ApprovalRequestParticipant
              displayName={assignee.displayName}
              email={assignee.email}
              type={assignee.type}
            />
          )}
          firstTimestamp={
            showTimeline ? (
              <TimelineTimestamp
                icon={getApprovalRequestTimestampIcon("pending")}
                iconSize="small"
                label="Waiting for previous step"
                text="Waiting for previous step"
              />
            ) : undefined
          }
        />
      }
    />
  </ApprovalRequestDetailsCard>
);

export default ApprovalUpcomingTaskBlock;
