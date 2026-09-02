import { NotificationType } from "@/shared/models/notifications";

export interface Notification {
  globalId: string;
  type: NotificationType;
  occurredAt: string;
  entityGlobalId: string;
  summary: string;
  readAt?: string;
}

export const notificationTypes = Object.values(NotificationType).filter(
  (type): type is NotificationType => typeof type === "number",
);

export const getNotificationTypeLabel = (type: NotificationType) =>
  ["New task", "Task completed", "Step completed", "Request completed", "New message"][type] ?? "Notification";
