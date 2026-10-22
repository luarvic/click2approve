import { NotificationType } from "@/shared/models/notifications";

export enum NotificationResourceType {
  ApprovalRequest = "ApprovalRequest",
  ApprovalRequestTask = "ApprovalRequestTask",
  DiscussionMessage = "DiscussionMessage",
  Receipt = "Receipt",
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

export const notificationTypes = Object.values(NotificationType);

const notificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.ApprovalRequestTaskCreated]: "New task",
  [NotificationType.ApprovalRequestTaskCompleted]: "Task completed",
  [NotificationType.ApprovalRequestStepCompleted]: "Step outcome",
  [NotificationType.ApprovalRequestCompleted]: "Request update",
  [NotificationType.DiscussionMessageCreated]: "New message",
  [NotificationType.BillingRecovery]: "Notification",
  [NotificationType.ReceiptCreated]: "New receipt",
};

export const getNotificationTypeLabel = (type: NotificationType) => notificationTypeLabels[type] ?? "Notification";

/** Uses the outcome recorded in the notification, independent of later request changes. */
export const getNotificationLabel = (notification: Pick<Notification, "type" | "summary">) => {
  const resource =
    notification.type === NotificationType.ApprovalRequestStepCompleted
      ? "Step"
      : notification.type === NotificationType.ApprovalRequestCompleted
        ? "Request"
        : undefined;

  if (resource) {
    if (notification.summary.endsWith(" succeeded.")) return `${resource} succeeded`;
    if (notification.summary.endsWith(" failed.")) return `${resource} failed`;
  }
  return getNotificationTypeLabel(notification.type);
};
