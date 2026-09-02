import type { NotificationStatus } from "@/features/notifications/models/notificationGridQuery";
import { getNotificationTypeLabel, notificationTypes } from "@/features/notifications/models/notification";
import { NotificationType } from "@/shared/models/notifications";
import { Autocomplete, Stack, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";

interface NotificationsFilterProps {
  details: string;
  receivedFrom: Dayjs | null;
  receivedTo: Dayjs | null;
  statuses: NotificationStatus[];
  types: NotificationType[];
  onDetailsChange: (details: string) => void;
  onReceivedFromChange: (receivedFrom: Dayjs | null) => void;
  onReceivedToChange: (receivedTo: Dayjs | null) => void;
  onStatusesChange: (statuses: NotificationStatus[]) => void;
  onTypesChange: (types: NotificationType[]) => void;
}

const filterStackSpacing = 2;
const filterFieldVariant = "outlined";
const notificationStatusOptions: NotificationStatus[] = ["read", "unread"];
const getNotificationStatusLabel = (status: NotificationStatus) => (status === "read" ? "Read" : "Unread");

const NotificationsFilter: React.FC<NotificationsFilterProps> = ({
  details,
  receivedFrom,
  receivedTo,
  statuses,
  types,
  onDetailsChange,
  onReceivedFromChange,
  onReceivedToChange,
  onStatusesChange,
  onTypesChange,
}) => (
  <Stack direction={{ xs: "column", md: "row" }} spacing={filterStackSpacing}>
    <Autocomplete
      multiple
      fullWidth
      getOptionLabel={getNotificationTypeLabel}
      options={notificationTypes}
      renderInput={(params) => <TextField {...params} label="Notification" variant={filterFieldVariant} />}
      value={types}
      onChange={(_event, nextTypes) => onTypesChange(nextTypes)}
    />
    <Autocomplete
      multiple
      fullWidth
      getOptionLabel={getNotificationStatusLabel}
      options={notificationStatusOptions}
      renderInput={(params) => <TextField {...params} label="Status" variant={filterFieldVariant} />}
      value={statuses}
      onChange={(_event, nextStatuses) => onStatusesChange(nextStatuses)}
    />
    <TextField
      fullWidth
      label="Details"
      value={details}
      variant={filterFieldVariant}
      onChange={(event) => onDetailsChange(event.target.value)}
    />
    <DatePicker
      label="Received from"
      slotProps={{ field: { clearable: true }, textField: { fullWidth: true, variant: filterFieldVariant } }}
      value={receivedFrom}
      onChange={onReceivedFromChange}
    />
    <DatePicker
      label="Received to"
      slotProps={{ field: { clearable: true }, textField: { fullWidth: true, variant: filterFieldVariant } }}
      value={receivedTo}
      onChange={onReceivedToChange}
    />
  </Stack>
);

export default NotificationsFilter;
