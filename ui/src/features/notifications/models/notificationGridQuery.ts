import { NotificationType } from "@/shared/models/notifications";
import { DataGrids } from "@/shared/constants/constants";

export type NotificationStatus = "read" | "unread";

export interface NotificationGridQuery {
  page: number;
  pageSize: number;
  sortDirection: "asc" | "desc";
  type: NotificationType[];
  status: NotificationStatus[];
  details: string;
  receivedFrom: string | null;
  receivedTo: string | null;
}

export const defaultNotificationGridQuery: NotificationGridQuery = {
  page: 0,
  pageSize: DataGrids.defaultPageSize,
  sortDirection: "desc",
  type: [],
  status: [],
  details: "",
  receivedFrom: null,
  receivedTo: null,
};

const notificationStatusValues = new Set<NotificationStatus>(["read", "unread"]);

const getNonNegativeInteger = (value: string | null, fallback: number): number => {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : fallback;
};

export const parseNotificationGridQuery = (parameters: URLSearchParams): NotificationGridQuery => {
  const pageSize = getNonNegativeInteger(parameters.get("pageSize"), defaultNotificationGridQuery.pageSize);
  const types = parameters
    .getAll("type")
    .map(Number)
    .filter((type): type is NotificationType => Number.isInteger(type) && type in NotificationType);

  return {
    page: getNonNegativeInteger(parameters.get("page"), defaultNotificationGridQuery.page),
    pageSize: DataGrids.pageSizeOptions.some((option) => option === pageSize)
      ? pageSize
      : defaultNotificationGridQuery.pageSize,
    sortDirection: parameters.get("sortDirection") === "asc" ? "asc" : "desc",
    type: types,
    status: parameters
      .getAll("status")
      .filter((status): status is NotificationStatus => notificationStatusValues.has(status as NotificationStatus)),
    details: parameters.get("details") ?? "",
    receivedFrom: parameters.get("receivedFrom"),
    receivedTo: parameters.get("receivedTo"),
  };
};

export const serializeNotificationGridQuery = (query: NotificationGridQuery): URLSearchParams => {
  const parameters = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortDirection: query.sortDirection,
  });
  query.type.forEach((type) => parameters.append("type", String(type)));
  query.status.forEach((status) => parameters.append("status", status));
  if (query.details) parameters.set("details", query.details);
  if (query.receivedFrom) parameters.set("receivedFrom", query.receivedFrom);
  if (query.receivedTo) parameters.set("receivedTo", query.receivedTo);
  return parameters;
};
