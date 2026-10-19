export enum EmployeeRole {
  User = "User",
  Admin = "Admin",
  Owner = "Owner",
}

export enum TenantType {
  Personal = "Personal",
  Business = "Business",
}

export enum SubscriptionPlan {
  PersonalFree = "PersonalFree",
  PersonalPro = "PersonalPro",
  BusinessTrial = "BusinessTrial",
  BusinessPro = "BusinessPro",
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
