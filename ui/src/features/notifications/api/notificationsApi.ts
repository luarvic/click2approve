import type { Notification } from "@/features/notifications/models/notification";
import { ApiPaths } from "@/shared/api/apiPaths";
import axios from "@/shared/api/axios";

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

export const markNotificationsRead = async (tenantId: string, notificationIds: string[]) =>
  await axios.post(
    ApiPaths.tenants.notificationsReadSelected(tenantId),
    { notificationGlobalIds: notificationIds },
    config,
  );

export const deleteNotifications = async (tenantId: string, notificationIds: string[]) =>
  await axios.delete(ApiPaths.tenants.notifications(tenantId), {
    ...config,
    data: { notificationGlobalIds: notificationIds },
  });
