import { EmployeeRole } from "@/features/tenants/models/tenant";

export enum EmployeeStatus {
  Pending = 0,
  Active = 1,
  Disabled = 2,
}

export interface EmployeeListItem {
  globalId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
}

export interface Employee extends EmployeeListItem {
  tenantGlobalId?: string;
  userGlobalId?: string;
  teamGlobalIds?: string[];
}

export interface EmployeePickerItem extends EmployeeListItem {}

export interface CreateEmployeeRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  role: EmployeeRole;
  teamGlobalIds: string[];
}

export interface UpdateEmployeeRequest {
  isActive?: boolean;
  firstName?: string;
  lastName?: string;
  position?: string;
  role: EmployeeRole;
  teamGlobalIds: string[];
}
