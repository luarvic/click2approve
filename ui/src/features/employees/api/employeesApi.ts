import {
  CreateEmployeeRequest,
  Employee,
  EmployeeListItem,
  EmployeePickerItem,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import { ApiPaths } from "@/shared/api/apiPaths";
import axios from "@/shared/api/axios";
import { PaginationLimits } from "@/shared/config/paginationLimits";
import type { GridPage } from "@/shared/grids/gridPage";
import type { SimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import { serializeSimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const listEmployeeGrid = async (
  tenantGlobalId: string,
  query: SimpleGridQuery,
): Promise<GridPage<EmployeeListItem>> => {
  try {
    const { data } = await axios.get<GridPage<EmployeeListItem>>(
      `${ApiPaths.tenants.employees(tenantGlobalId)}?${serializeSimpleGridQuery(query)}`,
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return { items: [], totalCount: 0 };
  }
};

export const listEmployees = async (tenantGlobalId: string): Promise<EmployeeListItem[]> => {
  return (
    await listEmployeeGrid(tenantGlobalId, {
      filters: {},
      page: 0,
      pageSize: PaginationLimits.maximumPageSize,
      sortBy: "email",
      sortDirection: "asc",
    })
  ).items;
};

export const listEmployeePicker = async (
  tenantGlobalId: string,
  selectedEmployeeGlobalIds: readonly string[] = [],
): Promise<EmployeePickerItem[]> => {
  try {
    const query = new URLSearchParams();
    selectedEmployeeGlobalIds.forEach((employeeGlobalId) =>
      query.append("selectedEmployeeGlobalIds", employeeGlobalId),
    );
    const path = ApiPaths.tenants.employeesPicker(tenantGlobalId);
    const { data } = await axios.get<EmployeePickerItem[]>(query.size > 0 ? `${path}?${query}` : path);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const getEmployee = async (tenantGlobalId: string, employeeGlobalId: string): Promise<Employee | null> => {
  try {
    const { data } = await axios.get<Employee>(ApiPaths.tenants.employee(tenantGlobalId, employeeGlobalId));
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const createEmployee = async (
  tenantGlobalId: string,
  payload: CreateEmployeeRequest,
): Promise<Employee | null> => {
  try {
    const { data } = await axios.post<Employee>(ApiPaths.tenants.employees(tenantGlobalId), payload);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const updateEmployee = async (
  tenantGlobalId: string,
  employeeGlobalId: string,
  payload: UpdateEmployeeRequest,
): Promise<Employee | null> => {
  try {
    const { data } = await axios.put<Employee>(ApiPaths.tenants.employee(tenantGlobalId, employeeGlobalId), payload);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const deleteEmployee = async (tenantGlobalId: string, employeeGlobalId: string): Promise<boolean> => {
  try {
    await axios.delete(ApiPaths.tenants.employee(tenantGlobalId, employeeGlobalId));
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};
