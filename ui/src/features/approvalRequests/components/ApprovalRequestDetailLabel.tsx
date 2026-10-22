import { Typography } from "@mui/material";

interface ApprovalRequestDetailLabelProps {
  children: string;
  id?: string;
}

const ApprovalRequestDetailLabel: React.FC<ApprovalRequestDetailLabelProps> = ({ children, id }) => (
  <Typography id={id} variant="caption" color="textSecondary">
    {children}
  </Typography>
);

export default ApprovalRequestDetailLabel;
