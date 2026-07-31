import { ApprovalRecipientType } from "@/features/approvalWorkflow/models/approvalStep";
import { StackSpacing } from "@/shared/constants/constants";
import {
  Email,
  Groups,
  Person,
} from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestParticipantLineProps {
  icon?: ReactNode;
  label?: ReactNode;
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

const ApprovalRequestParticipantLine: React.FC<ApprovalRequestParticipantLineProps> = ({
  icon,
  label,
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
    {typeof label === "string" || typeof label === "number" ? (
      <Typography variant="body1">
        {label}
      </Typography>
    ) : label}
  </Stack>
);

export default ApprovalRequestParticipantLine;
