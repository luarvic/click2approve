import { stores } from "@/app/rootStore";
import ApprovalRequestCardLayout from "@/features/approvalRequests/components/ApprovalRequestCardLayout";
import ApprovalRequestDetailsCard, {
  taskCardBackgroundSx,
} from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import ApprovalRequestFieldGroup from "@/features/approvalRequests/components/ApprovalRequestFieldGroup";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import { ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import { Business } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalUpcomingTaskBlockProps {
  assignee: ApprovalStepAssignee;
  compact?: boolean;
  defaultExpanded?: boolean;
  instructions?: string;
  showStatusBorder?: boolean;
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
  showStatusBorder = true,
  title = "Upcoming task",
}) => {
  const organizationIsVisible = stores.tenantStore.currentTenant?.type === TenantType.Personal;
  const organizationDisplayName = stores.tenantStore.currentTenant?.businessName;
  const visibleOrganizationDisplayName =
    organizationIsVisible && organizationDisplayName ? organizationDisplayName : undefined;
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
      borderLeftColor="action.disabled"
      contentSx={compact ? compactTaskCardContentSx : undefined}
      elevated
      showStatusBorder={showStatusBorder}
      sx={taskCardBackgroundSx}
    >
      <ApprovalRequestCardLayout
        activity={
          <ApprovalRequestFieldGroup title="Activity">
            {visibleOrganizationDisplayName && (
              <ApprovalRequestField
                label="From organization"
                value={visibleOrganizationDisplayName}
                valueIcon={<Business color="action" fontSize="small" />}
                valueVariant="body2"
              />
            )}
            <ApprovalRequestField label="Assignee" value={assigneeParticipant} />
          </ApprovalRequestFieldGroup>
        }
        defaultExpanded={defaultExpanded}
        details={
          <ApprovalRequestFieldGroup title="Details">
            <ApprovalRequestField label="Status" />
            <ApprovalRequestField
              label="Instructions"
              value={instructions?.trim() ? <UserProvidedText text={instructions} /> : undefined}
            />
          </ApprovalRequestFieldGroup>
        }
        expandable
        title={title}
      />
    </ApprovalRequestDetailsCard>
  );
};

export default ApprovalUpcomingTaskBlock;
