import { getApprovalRequestStatusLabel } from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import GridFilterBar from "@/shared/components/grids/GridFilterBar";
import { FieldLimits } from "@/shared/config/fieldLimits";
import type { Dayjs } from "dayjs";

interface ApprovalRequestsFilterProps {
  createdFrom: Dayjs | null;
  createdTo: Dayjs | null;
  onCreatedFromChange: (createdFrom: Dayjs | null) => void;
  onCreatedToChange: (createdTo: Dayjs | null) => void;
  onRequestedByChange: (requestedBy: string) => void;
  onStatusesChange: (statuses: ApprovalRequestStatus[]) => void;
  onTitleChange: (title: string) => void;
  requestedBy: string;
  statuses: ApprovalRequestStatus[];
  title: string;
}

const statusOptions = Object.values(ApprovalRequestStatus).filter(
  (status): status is ApprovalRequestStatus => typeof status === "number",
);

const ApprovalRequestsFilter: React.FC<ApprovalRequestsFilterProps> = ({
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
        {
          label: "Requested by",
          maxLength: FieldLimits.participantDisplayName,
          onChange: onRequestedByChange,
          type: "text",
          value: requestedBy,
        },
        {
          label: "Status",
          onChange: (values) => onStatusesChange(values.map((value) => Number(value) as ApprovalRequestStatus)),
          options: statusOptions.map((value) => ({
            label: getApprovalRequestStatusLabel(value),
            value: String(value),
          })),
          type: "multiSelect",
          value: statuses.map(String),
        },
        {
          label: "Created from",
          onChange: onCreatedFromChange,
          type: "date",
          maxDate: createdTo ?? undefined,
          value: createdFrom,
        },
        {
          label: "Created to",
          onChange: onCreatedToChange,
          type: "date",
          minDate: createdFrom ?? undefined,
          value: createdTo,
        },
      ]}
    />
  );
};

export default ApprovalRequestsFilter;
