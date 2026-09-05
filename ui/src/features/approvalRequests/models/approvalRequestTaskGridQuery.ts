import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { DataGrids } from "@/shared/components/grids/dataGridSettings";

export interface ApprovalRequestTaskGridQuery {
  page: number;
  pageSize: number;
  sortBy: "createdAt";
  sortDirection: "asc" | "desc";
  title: string;
  requestedBy: string;
  createdFrom: string | null;
  createdTo: string | null;
  status: ApprovalRequestTaskStatus[];
}

export const defaultApprovalRequestTaskGridQuery: ApprovalRequestTaskGridQuery = {
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

const approvalRequestTaskStatusNames = new Set(
  Object.keys(ApprovalRequestTaskStatus).filter((value) => Number.isNaN(Number(value))),
);

const getNonNegativeInteger = (value: string | null, fallback: number): number => {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : fallback;
};

export const parseApprovalRequestTaskGridQuery = (parameters: URLSearchParams): ApprovalRequestTaskGridQuery => {
  const pageSize = getNonNegativeInteger(parameters.get("pageSize"), defaultApprovalRequestTaskGridQuery.pageSize);
  const statuses = parameters
    .getAll("status")
    .filter((value): value is keyof typeof ApprovalRequestTaskStatus => approvalRequestTaskStatusNames.has(value))
    .map((value) => ApprovalRequestTaskStatus[value]);

  return {
    page: getNonNegativeInteger(parameters.get("page"), defaultApprovalRequestTaskGridQuery.page),
    pageSize: DataGrids.pageSizeOptions.some((option) => option === pageSize)
      ? pageSize
      : defaultApprovalRequestTaskGridQuery.pageSize,
    sortBy: "createdAt",
    sortDirection: parameters.get("sortDirection") === "asc" ? "asc" : "desc",
    title: parameters.get("title") ?? "",
    requestedBy: parameters.get("requestedBy") ?? "",
    createdFrom: parameters.get("createdFrom"),
    createdTo: parameters.get("createdTo"),
    status: statuses,
  };
};

export const serializeApprovalRequestTaskGridQuery = (query: ApprovalRequestTaskGridQuery): URLSearchParams => {
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
  query.status.forEach((status) => parameters.append("status", ApprovalRequestTaskStatus[status]));
  return parameters;
};
