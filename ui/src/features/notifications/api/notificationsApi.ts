import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";

export enum DomainEventType {
  ApprovalRequestTaskCreated = 0,
  ApprovalRequestCancelled = 1,
  ApprovalRequestReviewed = 2,
  DiscussionRequestMessageCreated = 3,
  DiscussionTaskMessageCreated = 4,
}

export interface Notification {
  globalId: string;
  type: DomainEventType;
  occurredAt: string;
  entityGlobalId: string;
  summary: string;
  readAt?: string;
}

const config = { useWorkEmployeeContext: true };
export const countUnreadNotifications = async (tenantId: string) =>
  (await axios.get<number>(ApiPaths.tenants.unreadNotificationCount(tenantId), config)).data;

export const listNotifications = async (tenantId: string, unreadOnly = true, take = 50) =>
  (
    await axios.get<Notification[]>(ApiPaths.tenants.notifications(tenantId), {
      ...config,
      params: { unreadOnly, take },
    })
  ).data;

export const markNotificationRead = async (tenantId: string, deliveryId: string) =>
  await axios.post(ApiPaths.tenants.notificationMarkRead(tenantId, deliveryId), undefined, config);

export const markNotificationsRead = async (tenantId: string, deliveryIds: string[]) =>
  await axios.post(ApiPaths.tenants.notificationsReadSelected(tenantId), { deliveryGlobalIds: deliveryIds }, config);

export const deleteNotifications = async (tenantId: string, deliveryIds: string[]) =>
  await axios.delete(ApiPaths.tenants.notifications(tenantId), {
    ...config,
    data: { deliveryGlobalIds: deliveryIds },
  });
