import { Icons, StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/helpers";
import {
  CancelOutlined,
  CheckCircleOutlineOutlined,
  DoNotDisturbOnOutlined,
  PendingOutlined,
  TimerOutlined,
} from "@mui/icons-material";
import { Stack, Tooltip, Typography } from "@mui/material";

export type ApprovalRequestTimestampType =
  | "approved"
  | "canceled"
  | "completed"
  | "created"
  | "pending"
  | "rejected"
  | "skipped";

interface ApprovalRequestTimestampProps {
  date: Date;
  label: string;
  type: ApprovalRequestTimestampType;
}

const getTimestampIcon = (type: ApprovalRequestTimestampType) => {
  switch (type) {
    case "created":
      return <TimerOutlined color={Icons.secondaryColor} fontSize="inherit" />;
    case "pending":
      return <PendingOutlined color={Icons.secondaryColor} fontSize="inherit" />;
    case "rejected":
      return <CancelOutlined color="warning" fontSize="inherit" />;
    case "canceled":
      return <CancelOutlined color="error" fontSize="inherit" />;
    case "skipped":
      return <DoNotDisturbOnOutlined color={Icons.secondaryColor} fontSize="inherit" />;
    case "approved":
    case "completed":
      return <CheckCircleOutlineOutlined color="success" fontSize="inherit" />;
  }
};

const ApprovalRequestTimestamp: React.FC<ApprovalRequestTimestampProps> = ({
  date,
  label,
  type,
}) => {
  const icon = getTimestampIcon(type);

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
