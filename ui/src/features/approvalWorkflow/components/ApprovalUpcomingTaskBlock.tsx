import { stores } from "@/app/rootStore";
import ApprovalRequestContentGroups from "@/features/approvalRequests/components/ApprovalRequestContentGroups";
import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import ApprovalRequestParticipantLabel from "@/features/approvalRequests/components/ApprovalRequestParticipantLabel";
import ApprovalRequestParticipantPair from "@/features/approvalRequests/components/ApprovalRequestParticipantPair";
import { getApprovalRequestTimestampIcon } from "@/features/approvalRequests/components/approvalRequestTimestampDisplay";
import { ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import TimelineTimestamp from "@/shared/components/timeline/TimelineTimestamp";
import { StackSpacing } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalUpcomingTaskBlockProps {
  assignee: ApprovalStepAssignee;
  compact?: boolean;
  instructions?: string;
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
  instructions,
  showAssigneeLabel = true,
  showStatusBorder = true,
  showTitle = true,
  showTimeline = true,
  title = "Upcoming task",
}) => {
  const organizationIsVisible = stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const organizationDisplayName = stores.tenantStore.currentTenant?.businessName;

  return (
    <ApprovalRequestDetailsCard
      ariaLabel={title}
      borderLeftColor="text.disabled"
      contentSx={compact ? compactTaskCardContentSx : undefined}
      showStatusBorder={showStatusBorder}
    >
      <ApprovalRequestContentGroups
        header={
          showTitle ? (
            <Typography component="h3" sx={upcomingTaskTitleSx} variant="h6">
              {title}
            </Typography>
          ) : undefined
        }
        content={
          <Stack spacing={StackSpacing.default}>
            {instructions?.trim() && <UserProvidedText text={instructions} />}
            <ApprovalRequestParticipantPair
              firstLabel={
                showAssigneeLabel ? (
                  <ApprovalRequestParticipantLabel>Assignee</ApprovalRequestParticipantLabel>
                ) : undefined
              }
              firstParticipant={
                <ApprovalRequestParticipant
                  displayName={assignee.displayName}
                  email={assignee.email}
                  organizationDisplayName={organizationDisplayName}
                  showOrganization={organizationIsVisible}
                  type={assignee.type}
                />
              }
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
          </Stack>
        }
      />
    </ApprovalRequestDetailsCard>
  );
};

export default ApprovalUpcomingTaskBlock;
