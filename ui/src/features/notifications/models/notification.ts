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
  [NotificationType.ApprovalRequestStepCompleted]: "Step completed",
  [NotificationType.ApprovalRequestCompleted]: "Request update",
  [NotificationType.DiscussionMessageCreated]: "New message",
  [NotificationType.BillingRecovery]: "Notification",
  [NotificationType.ReceiptCreated]: "New receipt",
};

export const getNotificationTypeLabel = (type: NotificationType) => notificationTypeLabels[type] ?? "Notification";
