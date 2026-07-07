export enum TenantUserRole {
  User = 0,
  Manager = 1,
  Admin = 2,
}

export enum TenantType {
  Personal = 0,
  Business = 1,
}

export interface ITenant {
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
  role: TenantUserRole;
}

export interface ITenantCreate {
  businessName: string;
  email?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  logo?: string;
}

export interface ITenantUpdate {
  businessName: string;
  email?: string;
  phone?: string;
  address?: string;
  websiteUrl?: string;
  logo?: string;
}
