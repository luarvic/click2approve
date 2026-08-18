import type { SxProps, Theme } from "@mui/material/styles";
import { Typography } from "@mui/material";

interface ApprovalRequestDetailLabelProps {
  children: string;
}

const labelSx: SxProps<Theme> = {
  color: "text.secondary",
  fontWeight: (theme) => theme.typography.fontWeightMedium,
};

const ApprovalRequestDetailLabel: React.FC<ApprovalRequestDetailLabelProps> = ({ children }) => (
  <Typography sx={labelSx} variant="body2">
    {children}
  </Typography>
);

export default ApprovalRequestDetailLabel;
