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
}

const upcomingTaskTitleSx: SxProps<Theme> = {
  color: "text.secondary",
};

const ApprovalUpcomingTaskBlock: React.FC<ApprovalUpcomingTaskBlockProps> = ({
  assignee,
}) => (
  <ApprovalRequestDetailsCard
    ariaLabel="Upcoming task"
    borderLeftColor="text.disabled"
  >
    <ApprovalRequestContentGroups
      header={
        <Typography component="h2" sx={upcomingTaskTitleSx} variant="subtitle1">
          Upcoming task
        </Typography>
      }
      metadata={
        <ApprovalRequestParticipantPair
          firstLabel={<ApprovalRequestParticipantLabel>Assignee</ApprovalRequestParticipantLabel>}
          firstParticipant={(
            <ApprovalRequestParticipant
              displayName={assignee.displayName}
              email={assignee.email}
              type={assignee.type}
            />
          )}
          firstTimestamp={(
            <TimelineTimestamp
              icon={getApprovalRequestTimestampIcon("pending")}
              iconSize="small"
              label="Waiting for previous step"
              text="Waiting for previous step"
            />
          )}
        />
      }
    />
  </ApprovalRequestDetailsCard>
);

export default ApprovalUpcomingTaskBlock;
