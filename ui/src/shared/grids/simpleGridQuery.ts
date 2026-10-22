import { DataGrids } from "@/shared/components/grids/dataGridSettings";

export type GridSortDirection = "asc" | "desc";

export interface SimpleGridQuery {
  page: number;
  pageSize: number;
  sortBy: string;
  sortDirection: GridSortDirection;
  filters: Record<string, string | string[]>;
}

const getNonNegativeInteger = (value: string | null, fallback: number): number => {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : fallback;
};

export const parseSimpleGridQuery = (
  parameters: URLSearchParams,
  defaultSortBy: string,
  allowedSortBy: readonly string[],
  filterKeys: readonly string[],
  multipleFilterKeys: readonly string[] = [],
): SimpleGridQuery => {
  const pageSize = getNonNegativeInteger(parameters.get("pageSize"), DataGrids.defaultPageSize);
  const sortBy = parameters.get("sortBy") ?? defaultSortBy;
  return {
    filters: Object.fromEntries(
      filterKeys.map((key) => [
        key,
        multipleFilterKeys.includes(key) ? parameters.getAll(key) : (parameters.get(key) ?? ""),
      ]),
    ),
    page: getNonNegativeInteger(parameters.get("page"), 0),
    pageSize: DataGrids.pageSizeOptions.some((option) => option === pageSize) ? pageSize : DataGrids.defaultPageSize,
    sortBy: allowedSortBy.includes(sortBy) ? sortBy : defaultSortBy,
    sortDirection: parameters.get("sortDirection") === "desc" ? "desc" : "asc",
  };
};

export const serializeSimpleGridQuery = (query: SimpleGridQuery): URLSearchParams => {
  const parameters = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  });
  Object.entries(query.filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => parameters.append(key, item));
    } else if (value) {
      parameters.set(key, value);
    }
  });
  return parameters;
};
