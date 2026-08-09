export enum EmployeeRole {
  User = 0,
  Admin = 1,
  Owner = 3,
}

export enum TenantType {
  Personal = 0,
  Business = 1,
}

export interface Tenant {
  globalId: string;
  businessName: string;
  type: TenantType;
  email?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  logo?: string;
  currentEmployeeRole: EmployeeRole;
  currentEmployeeGlobalId?: string;
  currentEmployeeDisplayName?: string;
  currentEmployeeFirstName?: string;
  currentEmployeeLastName?: string;
  delegators?: DelegatorEmployee[];
}

export interface DelegatorEmployee {
  employeeGlobalId: string;
  displayName: string;
}

export interface CreateTenantRequest {
  businessName: string;
  email?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
}

export interface UpdateTenantRequest {
  businessName: string;
  email?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
}
