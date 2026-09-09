export type NotificationSeverity = "error" | "success" | "warning";

export interface NotificationDetail {
  label: string;
  value: string;
}

export interface ErrorNotification {
  details: NotificationDetail[];
  message: string;
}

export interface Notification {
  details: NotificationDetail[];
  id: number;
  message: string;
  severity: NotificationSeverity;
}

type NotificationsListener = (notifications: Notification[]) => void;

let nextNotificationId = 1;
let notifications: Notification[] = [];
const listeners = new Set<NotificationsListener>();

const emit = (): void => {
  listeners.forEach((listener) => listener(notifications));
};

const show = (severity: NotificationSeverity, message: string, details: NotificationDetail[] = []): void => {
  notifications = [{ details, id: nextNotificationId++, message, severity }];
  emit();
};

export const notification = {
  error: (error: ErrorNotification | string | undefined): void => {
    if (error === undefined) {
      return;
    }

    const errorNotification = typeof error === "string" ? { details: [], message: error } : error;
    show("error", errorNotification.message, errorNotification.details);
  },
  success: (message: string): void => show("success", message),
  warning: (message: string): void => show("warning", message),
} as const;

export const dismissNotification = (id: number): void => {
  notifications = notifications.filter((notification) => notification.id !== id);
  emit();
};

export const subscribeToNotifications = (listener: NotificationsListener): (() => void) => {
  listeners.add(listener);
  listener(notifications);

  return () => listeners.delete(listener);
};
