import { NotificationType } from "@/shared/models/notifications";

export enum NotificationResourceType {
  ApprovalRequest,
  ApprovalRequestTask,
  DiscussionMessage,
  Receipt,
}

export interface Notification {
  globalId: string;
  type: NotificationType;
  occurredAt: string;
  targetResourceGlobalId?: string;
  targetResourceType?: NotificationResourceType;
  summary: string;
  readAt?: string;
}

export const notificationTypes = Object.values(NotificationType).filter(
  (type): type is NotificationType => typeof type === "number",
);

export const getNotificationTypeLabel = (type: NotificationType) =>
  ["New task", "Task completed", "Step completed", "Request update", "New message", "Notification", "New receipt"][
    type
  ] ?? "Notification";
