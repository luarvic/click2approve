import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { Autocomplete, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
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

const filterStackSpacing = 2;
const filterFieldVariant = "outlined";
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
        getOptionLabel={(status) => ApprovalRequestTaskStatus[status]}
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

export default ApprovalRequestTasksFilter;
