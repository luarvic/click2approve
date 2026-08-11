import {
  ApprovalRequestTimestampType,
  getApprovalRequestTimestampIcon,
} from "@/features/approvalRequests/components/approvalRequestTimestampDisplay";
import TimelineTimestamp from "@/shared/components/timeline/TimelineTimestamp";

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

  return <TimelineTimestamp date={date} icon={icon} label={label} />;
};

export default ApprovalRequestTimestamp;
