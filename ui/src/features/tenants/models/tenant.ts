export enum EmployeeRole {
  User = 0,
  Admin = 1,
  Owner = 3,
}

export enum TenantType {
  Personal = 0,
  Business = 1,
}

export enum SubscriptionPlan {
  PersonalFree = 0,
  PersonalPro = 1,
  BusinessTrial = 2,
  BusinessStarter = 3,
  BusinessStandard = 4,
  BusinessUltimate = 5,
}

export interface Tenant {
  globalId: string;
  businessName: string;
  type: TenantType;
  subscriptionPlan?: SubscriptionPlan;
  email?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  logo?: string;
  currentEmployeeRole: EmployeeRole;
  currentEmployeeGlobalId?: string;
  currentEmployeeEmail?: string;
  currentEmployeeFirstName?: string;
  currentEmployeeLastName?: string;
  currentEmployeePosition?: string;
  delegators?: DelegatorEmployee[];
}

export interface TenantListItem {
  globalId: string;
  businessName: string;
  type: TenantType;
  currentEmployeeRole: EmployeeRole;
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
  subscriptionPlan?: SubscriptionPlan;
}

export interface UpdateTenantRequest {
  businessName: string;
  email?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
}
