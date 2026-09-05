import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { DataGrids } from "@/shared/components/grids/dataGridSettings";

export interface ApprovalRequestGridQuery {
  page: number;
  pageSize: number;
  sortBy: "createdAt";
  sortDirection: "asc" | "desc";
  title: string;
  requestedBy: string;
  createdFrom: string | null;
  createdTo: string | null;
  status: ApprovalRequestStatus[];
}

export const defaultApprovalRequestGridQuery: ApprovalRequestGridQuery = {
  page: 0,
  pageSize: DataGrids.defaultPageSize,
  sortBy: "createdAt",
  sortDirection: "desc",
  title: "",
  requestedBy: "",
  createdFrom: null,
  createdTo: null,
  status: [],
};

const approvalRequestStatusNames = new Set(
  Object.keys(ApprovalRequestStatus).filter((value) => Number.isNaN(Number(value))),
);

const getNonNegativeInteger = (value: string | null, fallback: number): number => {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : fallback;
};

export const parseApprovalRequestGridQuery = (parameters: URLSearchParams): ApprovalRequestGridQuery => {
  const pageSize = getNonNegativeInteger(parameters.get("pageSize"), defaultApprovalRequestGridQuery.pageSize);
  const statuses = parameters
    .getAll("status")
    .filter((value): value is keyof typeof ApprovalRequestStatus => approvalRequestStatusNames.has(value))
    .map((value) => ApprovalRequestStatus[value]);

  return {
    page: getNonNegativeInteger(parameters.get("page"), defaultApprovalRequestGridQuery.page),
    pageSize: DataGrids.pageSizeOptions.some((option) => option === pageSize)
      ? pageSize
      : defaultApprovalRequestGridQuery.pageSize,
    sortBy: "createdAt",
    sortDirection: parameters.get("sortDirection") === "asc" ? "asc" : "desc",
    title: parameters.get("title") ?? "",
    requestedBy: parameters.get("requestedBy") ?? "",
    createdFrom: parameters.get("createdFrom"),
    createdTo: parameters.get("createdTo"),
    status: statuses,
  };
};

export const serializeApprovalRequestGridQuery = (query: ApprovalRequestGridQuery): URLSearchParams => {
  const parameters = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  });
  if (query.title) parameters.set("title", query.title);
  if (query.requestedBy) parameters.set("requestedBy", query.requestedBy);
  if (query.createdFrom) parameters.set("createdFrom", query.createdFrom);
  if (query.createdTo) parameters.set("createdTo", query.createdTo);
  query.status.forEach((status) => parameters.append("status", ApprovalRequestStatus[status]));
  return parameters;
};
