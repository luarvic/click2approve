import { NotificationType } from "@/shared/models/notifications";

export interface Notification {
  globalId: string;
  type: NotificationType;
  occurredAt: string;
  entityGlobalId: string;
  summary: string;
  readAt?: string;
}
