import { ApprovalRecipientType } from "@/features/approvalWorkflow/models/approvalStep";
import { Icons, StackSpacing } from "@/shared/constants/constants";
import {
  Email,
  Groups,
  Person,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Stack, Tooltip, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestParticipantLineProps {
  canViewRequest?: boolean;
  icon?: ReactNode;
  label?: ReactNode;
  showTrackingIndicator?: boolean;
  sx?: SxProps<Theme>;
  type?: ApprovalRecipientType;
}

export const getApprovalRecipientIcon = (type: ApprovalRecipientType) => {
  switch (type) {
    case ApprovalRecipientType.Employee:
      return <Person color="action" fontSize="small" />;
    case ApprovalRecipientType.Team:
      return <Groups color="action" fontSize="small" />;
    default:
      return <Email color="action" fontSize="small" />;
  }
};

export const renderApprovalRequestTrackingIndicator = (canViewRequest: boolean) => (
  <Tooltip title={canViewRequest ? "Can track request" : "Cannot track request"}>
    {canViewRequest
      ? <Visibility color={Icons.secondaryColor} fontSize="small" />
      : <VisibilityOff color={Icons.secondaryColor} fontSize="small" />}
  </Tooltip>
);

const ApprovalRequestParticipantLine: React.FC<ApprovalRequestParticipantLineProps> = ({
  canViewRequest,
  icon,
  label,
  showTrackingIndicator = false,
  sx,
  type = ApprovalRecipientType.Employee,
}) => (
  <Stack
    direction="row"
    spacing={StackSpacing.tight}
    alignItems="center"
    sx={sx}
  >
    {icon ?? getApprovalRecipientIcon(type)}
    <Typography variant="body1">
      {label}
    </Typography>
    {showTrackingIndicator &&
      canViewRequest !== undefined &&
      renderApprovalRequestTrackingIndicator(canViewRequest)}
  </Stack>
);

export default ApprovalRequestParticipantLine;
