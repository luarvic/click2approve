import { NotificationChannel, NotificationType } from "@/shared/models/notifications";

export interface UserNotificationPreference {
  type: NotificationType;
  channel: NotificationChannel;
  isEnabled: boolean;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  defaultTenantGlobalId?: string;
  defaultSignatureJson?: string;
  notificationPreferences: UserNotificationPreference[];
}

export interface UserProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  defaultTenantGlobalId?: string;
  defaultSignatureJson?: string;
  notificationPreferences: UserNotificationPreference[];
}
