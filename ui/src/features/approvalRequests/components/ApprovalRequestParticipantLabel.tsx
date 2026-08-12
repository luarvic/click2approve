import { Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface ApprovalRequestParticipantLabelProps {
  children: string;
}

const labelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontWeight: (theme) => theme.typography.fontWeightMedium,
};

const ApprovalRequestParticipantLabel: React.FC<ApprovalRequestParticipantLabelProps> = ({
  children,
}) => (
  <Typography sx={labelSx} variant="body2">
    {children}
  </Typography>
);

export default ApprovalRequestParticipantLabel;
