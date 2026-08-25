import { Typography } from "@mui/material";

interface ApprovalRequestDetailLabelProps {
  children: string;
  id?: string;
}

const ApprovalRequestDetailLabel: React.FC<ApprovalRequestDetailLabelProps> = ({ children, id }) => (
  <Typography color="text.secondary" id={id} variant="caption">
    {children}
  </Typography>
);

export default ApprovalRequestDetailLabel;
