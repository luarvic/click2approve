import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { StackSpacing } from "@/shared/theme/tokens";
import { Business, Terminal } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestParticipantProps {
  displayName?: string | null;
  email?: string | null;
  fallback?: string;
  icon?: ReactNode;
  isSystemParticipant?: boolean;
  organizationDisplayName?: string | null;
  showOrganization?: boolean;
  sx?: SxProps<Theme>;
  type?: AssigneeType;
  variant?: "body1" | "body2";
}

const ApprovalRequestParticipant: React.FC<ApprovalRequestParticipantProps> = ({
  displayName,
  email,
  fallback = "Unknown user",
  icon,
  isSystemParticipant = false,
  organizationDisplayName,
  showOrganization = false,
  sx,
  type = AssigneeType.Employee,
  variant = "body1",
}) => {
  const organizationIsVisible =
    !isSystemParticipant && showOrganization && type === AssigneeType.Employee && Boolean(organizationDisplayName);

  return (
    <Stack spacing={organizationIsVisible ? StackSpacing.tight : undefined} sx={sx}>
      <ApprovalRequestParticipantLine
        icon={isSystemParticipant ? <Terminal color="action" fontSize="small" /> : icon}
        displayName={displayName}
        email={email}
        label={isSystemParticipant ? displayName || email || fallback : undefined}
        type={type}
        variant={variant}
      />
      {organizationIsVisible && (
        <ApprovalRequestParticipantLine
          icon={<Business color="action" fontSize="small" />}
          label={organizationDisplayName}
          variant={variant}
        />
      )}
    </Stack>
  );
};

export default ApprovalRequestParticipant;
