export enum NotificationChannel {
  Email = 0,
}

export enum NotificationType {
  ApprovalRequestTaskCreated = 0,
  ApprovalRequestCancelled = 2,
  ApprovalRequestReviewed = 4,
}

export interface UserNotificationPreference {
  type: NotificationType;
  channel: NotificationChannel;
  isEnabled: boolean;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  defaultTenantId?: number;
  notificationPreferences: UserNotificationPreference[];
}

export interface UserProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  defaultTenantId?: number;
  notificationPreferences: UserNotificationPreference[];
}
