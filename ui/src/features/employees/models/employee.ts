import { EmployeeRole } from "@/features/tenants/models/tenant";

export enum EmployeeStatus {
  Pending = 0,
  Active = 1,
}

export interface Employee {
  globalId: string;
  tenantGlobalId: string;
  userGlobalId?: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  role: EmployeeRole;
  status: EmployeeStatus;
}

export interface CreateEmployeeRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  role: EmployeeRole;
  teamGlobalIds: string[];
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  position?: string;
  role: EmployeeRole;
  teamGlobalIds: string[];
}
