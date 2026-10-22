import { makeAutoObservable } from "mobx";

/** Remembers tenants whose protected API requests have been suspended. */
export class BillingAccessStore {
  private blockedTenantGlobalIds = new Set<string>();

  constructor() {
    makeAutoObservable(this);
  }

  isBlocked = (tenantGlobalId: string): boolean => this.blockedTenantGlobalIds.has(tenantGlobalId);

  block = (tenantGlobalId: string): void => {
    this.blockedTenantGlobalIds.add(tenantGlobalId);
  };

  unblock = (tenantGlobalId: string): void => {
    this.blockedTenantGlobalIds.delete(tenantGlobalId);
  };

  clear = (): void => {
    this.blockedTenantGlobalIds.clear();
  };
}
