import type { Notification } from "@/features/notifications/models/notification";
import {
  serializeNotificationGridQuery,
  type NotificationGridQuery,
} from "@/features/notifications/models/notificationGridQuery";
import { ApiPaths } from "@/shared/api/apiPaths";
import axios from "@/shared/api/axios";
import type { GridPage } from "@/shared/grids/gridPage";

const config = { useWorkEmployeeContext: true };
export const countUnreadNotifications = async (tenantId: string) =>
  (await axios.get<number>(ApiPaths.tenants.unreadNotificationCount(tenantId), config)).data;

export const listNotifications = async (
  tenantId: string,
  query: NotificationGridQuery,
): Promise<GridPage<Notification>> =>
  (
    await axios.get<GridPage<Notification>>(
      `${ApiPaths.tenants.notifications(tenantId)}?${serializeNotificationGridQuery(query)}`,
      config,
    )
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
