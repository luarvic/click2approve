import {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from "@/features/employees/models/employee";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const listEmployees = async (
  tenantId: number
): Promise<Employee[]> => {
  try {
    const { data } = await axios.get<Employee[]>(
      `api/tenants/${tenantId}/employees`
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const createEmployee = async (
  tenantId: number,
  payload: CreateEmployeeRequest
): Promise<Employee | null> => {
  try {
    const { data } = await axios.post<Employee>(
      `api/tenants/${tenantId}/employees`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const updateEmployee = async (
  tenantId: number,
  employeeId: number,
  payload: UpdateEmployeeRequest
): Promise<Employee | null> => {
  try {
    const { data } = await axios.put<Employee>(
      `api/tenants/${tenantId}/employees/${employeeId}`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteEmployee = async (
  tenantId: number,
  employeeId: number
): Promise<boolean> => {
  try {
    await axios.delete(`api/tenants/${tenantId}/employees/${employeeId}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
