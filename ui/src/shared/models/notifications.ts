export enum NotificationType {
  ApprovalRequestTaskCreated = 0,
  ApprovalRequestTaskCompleted = 1,
  ApprovalRequestStepCompleted = 2,
  ApprovalRequestCompleted = 3,
  DiscussionMessageCreated = 4,
  BillingRecovery = 5,
}

export enum NotificationChannel {
  InApp = 0,
  Email = 1,
}

export enum NotificationPreferenceType {
  Requests = 0,
  Tasks = 1,
  Chat = 2,
  Billing = 3,
}

export const notificationPreferenceTypeLabels: Record<NotificationPreferenceType, string> = {
  [NotificationPreferenceType.Requests]: "Request notifications",
  [NotificationPreferenceType.Tasks]: "Task notifications",
  [NotificationPreferenceType.Chat]: "Chat notifications",
  [NotificationPreferenceType.Billing]: "Billing recovery reminders",
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
};
