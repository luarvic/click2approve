import { TenantUserRole } from "./tenant";

export enum TenantUserStatus {
  Pending = 0,
  Active = 1,
}

export interface ITenantUser {
  id: number;
  tenantId: number;
  userId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  role: TenantUserRole;
  status: TenantUserStatus;
}

export interface ITenantUserCreate {
  email: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  role: TenantUserRole;
}

export interface ITenantUserUpdate {
  firstName?: string;
  lastName?: string;
  position?: string;
  role: TenantUserRole;
}
