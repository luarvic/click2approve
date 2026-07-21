import ApprovalRequestTimestamp, {
  type ApprovalRequestTimestampType,
} from "@/features/approvalRequests/components/ApprovalRequestTimestamp";
import { StackSpacing } from "@/shared/constants/constants";
import { Divider, Stack } from "@mui/material";

export interface ApprovalRequestTimestampRowItem {
  date: Date;
  label: string;
  type: ApprovalRequestTimestampType;
}

interface ApprovalRequestTimestampRowProps {
  items: (ApprovalRequestTimestampRowItem | null | undefined)[];
}

const ApprovalRequestTimestampRow: React.FC<ApprovalRequestTimestampRowProps> = ({
  items,
}) => {
  const visibleItems = items.filter(Boolean) as ApprovalRequestTimestampRowItem[];

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: StackSpacing.tight, sm: StackSpacing.default }}
      divider={<Divider orientation="vertical" flexItem />}
    >
      {visibleItems.map((item) => (
        <ApprovalRequestTimestamp
          key={`${item.label}-${item.date.toISOString()}`}
          date={item.date}
          label={item.label}
          type={item.type}
        />
      ))}
    </Stack>
  );
};

export default ApprovalRequestTimestampRow;
