import {
  ApprovalRequestTimestampType,
  getApprovalRequestTimestampIcon,
} from "@/features/approvalRequests/components/approvalRequestTimestampDisplay";
import { StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/dateTime";
import { Stack, Tooltip, Typography } from "@mui/material";

interface ApprovalRequestTimestampProps {
  date: Date;
  label: string;
  type: ApprovalRequestTimestampType;
}

const ApprovalRequestTimestamp: React.FC<ApprovalRequestTimestampProps> = ({
  date,
  label,
  type,
}) => {
  const icon = getApprovalRequestTimestampIcon(type);

  return (
    <Stack
      direction="row"
      spacing={StackSpacing.tight}
      alignItems="center"
    >
      <Tooltip title={label}>
        {icon}
      </Tooltip>
      <Typography variant="caption" color="text.secondary">
        {getLocaleDateTimeString(date)}
      </Typography>
    </Stack>
  );
};

export default ApprovalRequestTimestamp;
