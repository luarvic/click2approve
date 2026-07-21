import { EmployeeRole } from "@/features/tenants/models/tenant";

export enum EmployeeStatus {
  Pending = 0,
  Active = 1,
}

export interface Employee {
  id: number;
  tenantId: number;
  userId?: string;
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
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  position?: string;
  role: EmployeeRole;
}
