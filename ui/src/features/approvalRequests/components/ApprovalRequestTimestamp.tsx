import {
  ApprovalRequestTimestampType,
  getApprovalRequestTimestampIcon,
} from "@/features/approvalRequests/components/approvalRequestTimestampDisplay";
import TimelineTimestamp from "@/shared/components/timeline/TimelineTimestamp";

interface ApprovalRequestTimestampProps {
  date: Date;
  iconSize?: "inherit" | "small";
  label: string;
  type: ApprovalRequestTimestampType;
}

const ApprovalRequestTimestamp: React.FC<ApprovalRequestTimestampProps> = ({
  date,
  iconSize = "small",
  label,
  type,
}) => {
  const icon = getApprovalRequestTimestampIcon(type);

  return <TimelineTimestamp date={date} icon={icon} iconSize={iconSize} label={label} />;
};

export default ApprovalRequestTimestamp;
