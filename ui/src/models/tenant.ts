export enum TenantUserRole {
  User = 0,
  Manager = 1,
  Admin = 2,
}

export interface ITenant {
  id: number;
  businessName: string;
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
