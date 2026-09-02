import { getApprovalRequestStatusLabel } from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { Autocomplete, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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

const filterStackSpacing = 2;
const filterFieldVariant = "outlined";
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
    <Stack direction={{ xs: "column", md: "row" }} spacing={filterStackSpacing}>
      <TextField
        fullWidth
        label="Title"
        variant={filterFieldVariant}
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
      />
      <TextField
        fullWidth
        label="Requested by"
        variant={filterFieldVariant}
        value={requestedBy}
        onChange={(event) => onRequestedByChange(event.target.value)}
      />
      <Autocomplete
        multiple
        fullWidth
        options={statusOptions}
        getOptionLabel={getApprovalRequestStatusLabel}
        renderInput={(params) => <TextField {...params} label="Status" variant={filterFieldVariant} />}
        value={statuses}
        onChange={(_event, nextStatuses) => onStatusesChange(nextStatuses)}
      />
      <DatePicker
        label="Created from"
        slotProps={{ field: { clearable: true }, textField: { fullWidth: true, variant: filterFieldVariant } }}
        value={createdFrom}
        onChange={onCreatedFromChange}
      />
      <DatePicker
        label="Created to"
        slotProps={{ field: { clearable: true }, textField: { fullWidth: true, variant: filterFieldVariant } }}
        value={createdTo}
        onChange={onCreatedToChange}
      />
    </Stack>
  );
};

export default ApprovalRequestsFilter;
