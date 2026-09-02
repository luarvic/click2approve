import type { NotificationStatus } from "@/features/notifications/models/notificationGridQuery";
import { getNotificationTypeLabel, notificationTypes } from "@/features/notifications/models/notification";
import GridFilterBar from "@/shared/components/grids/GridFilterBar";
import { NotificationType } from "@/shared/models/notifications";
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
  <GridFilterBar
    items={[
      {
        label: "Notification",
        onChange: (values) => onTypesChange(values.map((value) => Number(value) as NotificationType)),
        options: notificationTypes.map((value) => ({ label: getNotificationTypeLabel(value), value: String(value) })),
        type: "multiSelect",
        value: types.map(String),
      },
      {
        label: "Status",
        onChange: (values) => onStatusesChange(values as NotificationStatus[]),
        options: notificationStatusOptions.map((value) => ({ label: getNotificationStatusLabel(value), value })),
        type: "multiSelect",
        value: statuses,
      },
      { label: "Details", onChange: onDetailsChange, type: "text", value: details },
      { label: "Received from", onChange: onReceivedFromChange, type: "date", value: receivedFrom },
      { label: "Received to", onChange: onReceivedToChange, type: "date", value: receivedTo },
    ]}
  />
);

export default NotificationsFilter;
