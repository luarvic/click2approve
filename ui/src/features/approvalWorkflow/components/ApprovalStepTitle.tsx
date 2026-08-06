import { Typography } from "@mui/material";

interface ApprovalStepTitleProps {
  sequence: number;
}

const ApprovalStepTitle: React.FC<ApprovalStepTitleProps> = ({ sequence }) => (
  <Typography variant="subtitle1">Step {sequence}</Typography>
);

export default ApprovalStepTitle;
