export enum EmployeeRole {
  User = 0,
  Manager = 1,
  Admin = 2,
}

export enum TenantType {
  Personal = 0,
  Business = 1,
}

export interface Tenant {
  id: number;
  businessName: string;
  type: TenantType;
  email?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  logo?: string;
  ownerId: string;
  isOwner: boolean;
  role: EmployeeRole;
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
