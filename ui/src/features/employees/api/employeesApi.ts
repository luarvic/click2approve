import {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const listEmployees = async (
  tenantGlobalId: string
): Promise<Employee[]> => {
  try {
    const { data } = await axios.get<Employee[]>(
      `api/v1/tenants/${tenantGlobalId}/employees`
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const createEmployee = async (
  tenantGlobalId: string,
  payload: CreateEmployeeRequest
): Promise<Employee | null> => {
  try {
    const { data } = await axios.post<Employee>(
      `api/v1/tenants/${tenantGlobalId}/employees`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const updateEmployee = async (
  tenantGlobalId: string,
  employeeGlobalId: string,
  payload: UpdateEmployeeRequest
): Promise<Employee | null> => {
  try {
    const { data } = await axios.put<Employee>(
      `api/v1/tenants/${tenantGlobalId}/employees/${employeeGlobalId}`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteEmployee = async (
  tenantGlobalId: string,
  employeeGlobalId: string
): Promise<boolean> => {
  try {
    await axios.delete(`api/v1/tenants/${tenantGlobalId}/employees/${employeeGlobalId}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
