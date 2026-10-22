export enum NotificationType {
  ApprovalRequestTaskCreated = "ApprovalRequestTaskCreated",
  ApprovalRequestTaskCompleted = "ApprovalRequestTaskCompleted",
  ApprovalRequestStepCompleted = "ApprovalRequestStepCompleted",
  ApprovalRequestCompleted = "ApprovalRequestCompleted",
  DiscussionMessageCreated = "DiscussionMessageCreated",
  BillingRecovery = "BillingRecovery",
  ReceiptCreated = "ReceiptCreated",
}

export enum NotificationChannel {
  InApp = "InApp",
  Email = "Email",
}

export enum NotificationPreferenceType {
  Requests = "Requests",
  Tasks = "Tasks",
  Chat = "Chat",
  Billing = "Billing",
  Receipts = "Receipts",
}

export const notificationPreferenceTypeLabels: Record<NotificationPreferenceType, string> = {
  [NotificationPreferenceType.Requests]: "Request notifications",
  [NotificationPreferenceType.Tasks]: "Task notifications",
  [NotificationPreferenceType.Chat]: "Chat notifications",
  [NotificationPreferenceType.Billing]: "Billing recovery reminders",
  [NotificationPreferenceType.Receipts]: "Receipt notifications",
};

export const notificationChannelLabels: Record<NotificationChannel, string> = {
  [NotificationChannel.InApp]: "In-app",
  [NotificationChannel.Email]: "Email",
};

export const notificationPreferenceTypeToNotificationTypes: Record<NotificationPreferenceType, NotificationType[]> = {
  [NotificationPreferenceType.Requests]: [
    NotificationType.ApprovalRequestStepCompleted,
    NotificationType.ApprovalRequestCompleted,
  ],
  [NotificationPreferenceType.Tasks]: [
    NotificationType.ApprovalRequestTaskCreated,
    NotificationType.ApprovalRequestTaskCompleted,
  ],
  [NotificationPreferenceType.Chat]: [NotificationType.DiscussionMessageCreated],
  [NotificationPreferenceType.Billing]: [NotificationType.BillingRecovery],
  [NotificationPreferenceType.Receipts]: [NotificationType.ReceiptCreated],
};
