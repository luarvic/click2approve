import { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from "@/features/employees/models/employee";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const listEmployees = async (tenantGlobalId: string): Promise<Employee[]> => {
  try {
    const { data } = await axios.get<Employee[]>(ApiPaths.tenants.employees(tenantGlobalId));
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
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
