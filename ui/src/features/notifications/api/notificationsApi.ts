import axios from "@/shared/api/axios";

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
const route = (tenantId: string) => `api/v1/tenants/${tenantId}/notifications`;

export const countUnreadNotifications = async (tenantId: string) =>
  (await axios.get<number>(`${route(tenantId)}/unread/count`, config)).data;

export const listNotifications = async (tenantId: string, unreadOnly = true, take = 50) =>
  (
    await axios.get<Notification[]>(route(tenantId), {
      ...config,
      params: { unreadOnly, take },
    })
  ).data;

export const markNotificationRead = async (tenantId: string, deliveryId: string) =>
  await axios.post(`${route(tenantId)}/${deliveryId}/read`, undefined, config);

export const markNotificationsRead = async (tenantId: string, deliveryIds: string[]) =>
  await axios.post(`${route(tenantId)}/readSelected`, { deliveryGlobalIds: deliveryIds }, config);

export const deleteNotifications = async (tenantId: string, deliveryIds: string[]) =>
  await axios.delete(route(tenantId), {
    ...config,
    data: { deliveryGlobalIds: deliveryIds },
  });
