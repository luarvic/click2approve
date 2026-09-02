import {
  CreateEmployeeRequest,
  Employee,
  EmployeeListItem,
  EmployeePickerItem,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";
import { serializeSimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import type { SimpleGridQuery } from "@/shared/grids/simpleGridQuery";
import type { GridPage } from "@/shared/grids/gridPage";

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
      pageSize: 100,
      sortBy: "email",
      sortDirection: "asc",
    })
  ).items;
};

export const listEmployeePicker = async (tenantGlobalId: string): Promise<EmployeePickerItem[]> => {
  try {
    const { data } = await axios.get<EmployeePickerItem[]>(ApiPaths.tenants.employeesPicker(tenantGlobalId));
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
