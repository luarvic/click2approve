import { Chip, Tooltip } from "@mui/material";

interface ApprovalRequestRevisionChipProps {
  revisionNumber?: number;
}

const ApprovalRequestRevisionChip: React.FC<ApprovalRequestRevisionChipProps> = ({
  revisionNumber,
}) => {
  if (!revisionNumber || revisionNumber <= 1) {
    return null;
  }

  return (
    <Tooltip title={`Revision ${revisionNumber}`}>
      <Chip
        label={`v${revisionNumber}`}
        size="small"
      />
    </Tooltip>
  );
};

export default ApprovalRequestRevisionChip;
