import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import GridFilterBar from "@/shared/components/grids/GridFilterBar";
import type { Dayjs } from "dayjs";

interface ApprovalRequestTasksFilterProps {
  createdFrom: Dayjs | null;
  createdTo: Dayjs | null;
  onCreatedFromChange: (createdFrom: Dayjs | null) => void;
  onCreatedToChange: (createdTo: Dayjs | null) => void;
  onRequestedByChange: (requestedBy: string) => void;
  onStatusesChange: (statuses: ApprovalRequestTaskStatus[]) => void;
  onTitleChange: (title: string) => void;
  requestedBy: string;
  statuses: ApprovalRequestTaskStatus[];
  title: string;
}

const statusOptions = Object.values(ApprovalRequestTaskStatus).filter(
  (status): status is ApprovalRequestTaskStatus => typeof status === "number",
);

const ApprovalRequestTasksFilter: React.FC<ApprovalRequestTasksFilterProps> = ({
  createdFrom,
  createdTo,
  onCreatedFromChange,
  onCreatedToChange,
  onRequestedByChange,
  onStatusesChange,
  onTitleChange,
  requestedBy,
  statuses,
  title,
}) => {
  return (
    <GridFilterBar
      items={[
        { label: "Title", onChange: onTitleChange, type: "text", value: title },
        { label: "Requested by", onChange: onRequestedByChange, type: "text", value: requestedBy },
        {
          label: "Status",
          onChange: (values) => onStatusesChange(values.map((value) => Number(value) as ApprovalRequestTaskStatus)),
          options: statusOptions.map((value) => ({ label: ApprovalRequestTaskStatus[value], value: String(value) })),
          type: "multiSelect",
          value: statuses.map(String),
        },
        { label: "Created from", onChange: onCreatedFromChange, type: "date", value: createdFrom },
        { label: "Created to", onChange: onCreatedToChange, type: "date", value: createdTo },
      ]}
    />
  );
};

export default ApprovalRequestTasksFilter;
