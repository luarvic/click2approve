import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import { ApprovalRecipientType } from "@/features/approvalWorkflow/models/approvalStep";
import DisplayName from "@/shared/components/identity/DisplayName";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestParticipantProps {
  displayName?: string | null;
  email?: string | null;
  fallback?: string;
  icon?: ReactNode;
  organizationDisplayName?: string | null;
  showOrganization?: boolean;
  sx?: SxProps<Theme>;
  type?: ApprovalRecipientType;
}

const getParticipantDisplayName = (
  displayName?: string | null,
  organizationDisplayName?: string | null,
  showOrganization: boolean = false,
) => {
  const name = stripInlineEmail(displayName);
  return showOrganization && organizationDisplayName && name
    ? `${name} · ${organizationDisplayName}`
    : name;
};

const ApprovalRequestParticipant: React.FC<ApprovalRequestParticipantProps> = ({
  displayName,
  email,
  fallback = "Unknown user",
  icon,
  organizationDisplayName,
  showOrganization = false,
  sx,
  type = ApprovalRecipientType.Employee,
}) => {
  const participantDisplayName = getParticipantDisplayName(
    displayName,
    organizationDisplayName,
    showOrganization,
  );
  const emailLabel = email ?? participantDisplayName ?? fallback;

  return (
    <ApprovalRequestParticipantLine
      icon={icon}
      label={
        type === ApprovalRecipientType.Email
          ? emailLabel
          : (
            <DisplayName
              displayName={participantDisplayName}
              email={email}
              fallback={fallback}
            />
          )
      }
      sx={sx}
      type={type}
    />
  );
};

export default ApprovalRequestParticipant;
