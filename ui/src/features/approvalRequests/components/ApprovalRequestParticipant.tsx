import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import DisplayName from "@/shared/components/identity/DisplayName";
import { StackSpacing } from "@/shared/constants/constants";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import { Business, Terminal } from "@mui/icons-material";
import { Stack } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestParticipantProps {
  displayName?: string | null;
  email?: string | null;
  fallback?: string;
  icon?: ReactNode;
  isSystemParticipant?: boolean;
  organizationDisplayName?: string | null;
  showEmployeeEmailAddress?: boolean;
  showOrganization?: boolean;
  sx?: SxProps<Theme>;
  type?: AssigneeType;
}

const getParticipantDisplayName = (
  displayName?: string | null,
) => stripInlineEmail(displayName);

const ApprovalRequestParticipant: React.FC<ApprovalRequestParticipantProps> = ({
  displayName,
  email,
  fallback = "Unknown user",
  icon,
  isSystemParticipant = false,
  organizationDisplayName,
  showEmployeeEmailAddress = false,
  showOrganization = false,
  sx,
  type = AssigneeType.Employee,
}) => {
  const participantDisplayName = getParticipantDisplayName(
    displayName,
  );
  const emailLabel = email ?? participantDisplayName ?? fallback;
  const participantPrimaryLabel =
    !isSystemParticipant && type === AssigneeType.User
      ? emailLabel
      : participantDisplayName;
  const organizationIsVisible =
    !isSystemParticipant &&
    showOrganization &&
    type === AssigneeType.Employee &&
    Boolean(organizationDisplayName);

  return (
    <Stack spacing={organizationIsVisible ? StackSpacing.tight : undefined} sx={sx}>
      <ApprovalRequestParticipantLine
        icon={isSystemParticipant ? <Terminal color="action" fontSize="small" /> : icon}
        label={(
          <DisplayName
            displayName={participantPrimaryLabel}
            email={email}
            fallback={fallback}
            showEmailAddress={type !== AssigneeType.Employee || showEmployeeEmailAddress}
          />
        )}
        type={type}
      />
      {organizationIsVisible && (
        <ApprovalRequestParticipantLine
          icon={<Business color="action" fontSize="small" />}
          label={organizationDisplayName}
        />
      )}
    </Stack>
  );
};

export default ApprovalRequestParticipant;
