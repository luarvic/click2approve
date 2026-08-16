import * as tenantApi from "@/features/tenants/api/tenantsApi";
import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import {
  deleteCurrentTenantGlobalId,
  deleteCurrentWorkEmployeeGlobalId,
  readCurrentTenantGlobalId,
  readCurrentWorkEmployeeGlobalId,
  writeCurrentTenantGlobalId,
  writeCurrentWorkEmployeeGlobalId,
} from "@/shared/session/session";
import { makeAutoObservable, runInAction } from "mobx";

export class TenantStore {
  tenants: Tenant[];
  currentTenantGlobalId: string | null;
  currentWorkEmployeeGlobalId: string | null;
  hasLoaded: boolean;
  // Incremented to invalidate older async requests so only the latest response updates the store.
  private requestVersion = 0;

  constructor(
    tenants: Tenant[] = [],
    currentTenantGlobalId: string | null = readCurrentTenantGlobalId(),
    currentWorkEmployeeGlobalId: string | null = readCurrentWorkEmployeeGlobalId(),
    hasLoaded: boolean = false,
  ) {
    this.tenants = tenants;
    this.currentTenantGlobalId = currentTenantGlobalId;
    this.currentWorkEmployeeGlobalId = currentWorkEmployeeGlobalId;
    this.hasLoaded = hasLoaded;
    makeAutoObservable(this);
  }

  get currentTenant(): Tenant | null {
    return this.tenants.find((tenant) => tenant.globalId === this.currentTenantGlobalId) ?? null;
  }

  loadCurrent = async (): Promise<void> => {
    const requestVersion = ++this.requestVersion;
    const tenantGlobalId = await tenantApi.getCurrentTenantId();
    if (requestVersion !== this.requestVersion) {
      return;
    }
    runInAction(() => {
      this.tenants = [];
      this.currentTenantGlobalId = tenantGlobalId;
      this.currentWorkEmployeeGlobalId = null;
      this.hasLoaded = true;
    });
    if (tenantGlobalId) {
      writeCurrentTenantGlobalId(tenantGlobalId);
    } else {
      deleteCurrentTenantGlobalId();
    }
  };

  load = async (defaultTenantGlobalId?: string): Promise<void> => {
    const requestVersion = ++this.requestVersion;
    const tenants = await tenantApi.listTenants();
    if (requestVersion !== this.requestVersion) {
      return;
    }
    const cachedTenantId = readCurrentTenantGlobalId();
    const cachedWorkEmployeeGlobalId = readCurrentWorkEmployeeGlobalId();
    const currentTenant =
      tenants.find((tenant) => tenant.globalId === defaultTenantGlobalId) ??
      tenants.find((tenant) => tenant.globalId === cachedTenantId) ??
      tenants[0] ??
      null;
    runInAction(() => {
      this.tenants = tenants;
      this.currentTenantGlobalId = currentTenant?.globalId ?? null;
      this.currentWorkEmployeeGlobalId =
        currentTenant &&
        cachedWorkEmployeeGlobalId &&
        (currentTenant.currentEmployeeGlobalId === cachedWorkEmployeeGlobalId ||
          currentTenant.delegators?.some((delegator) => delegator.employeeGlobalId === cachedWorkEmployeeGlobalId))
          ? cachedWorkEmployeeGlobalId
          : (currentTenant?.currentEmployeeGlobalId ?? null);
      this.hasLoaded = true;
    });
    if (currentTenant) {
      writeCurrentTenantGlobalId(currentTenant.globalId);
      writeCurrentWorkEmployeeGlobalId(this.currentWorkEmployeeGlobalId);
    } else {
      deleteCurrentTenantGlobalId();
    }
  };

  create = async (payload: CreateTenantRequest): Promise<Tenant | null> => {
    const requestVersion = this.requestVersion;
    const tenant = await tenantApi.createTenant(payload);
    if (!tenant || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.tenants = [...this.tenants, tenant];
      this.currentTenantGlobalId = tenant.globalId;
      this.hasLoaded = true;
    });
    writeCurrentTenantGlobalId(tenant.globalId);
    return tenant;
  };

  createWithLogo = async (payload: CreateTenantRequest, logo: File): Promise<Tenant | null> => {
    const requestVersion = this.requestVersion;
    const currentTenantGlobalId = this.currentTenantGlobalId;
    if (!currentTenantGlobalId) {
      return null;
    }

    const tenant = await tenantApi.createTenantWithLogo(currentTenantGlobalId, payload, logo);
    if (!tenant || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.tenants = [...this.tenants, tenant];
      this.currentTenantGlobalId = tenant.globalId;
      this.hasLoaded = true;
    });
    writeCurrentTenantGlobalId(tenant.globalId);
    return tenant;
  };

  update = async (tenantGlobalId: string, payload: UpdateTenantRequest): Promise<Tenant | null> => {
    const requestVersion = this.requestVersion;
    const tenant = await tenantApi.updateTenant(tenantGlobalId, payload);
    if (!tenant || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.tenants = this.tenants.map((existingTenant) =>
        existingTenant.globalId === tenant.globalId ? tenant : existingTenant,
      );
      this.hasLoaded = true;
    });
    return tenant;
  };

  uploadLogo = async (tenantGlobalId: string, logo: File): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    const currentTenantGlobalId = this.currentTenantGlobalId;
    if (!currentTenantGlobalId) {
      return false;
    }

    const tenant = await tenantApi.uploadTenantLogo(currentTenantGlobalId, tenantGlobalId, logo);
    if (!tenant || requestVersion !== this.requestVersion) {
      return false;
    }

    this.replaceTenant(tenant);
    return true;
  };

  deleteLogo = async (tenantGlobalId: string): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    const tenant = await tenantApi.deleteTenantLogo(tenantGlobalId);
    if (!tenant || requestVersion !== this.requestVersion) {
      return false;
    }

    this.replaceTenant(tenant);
    return true;
  };

  setCurrentGlobalId = (tenantGlobalId: string): void => {
    runInAction(() => {
      this.currentTenantGlobalId = tenantGlobalId;
    });
    writeCurrentTenantGlobalId(tenantGlobalId);
  };

  setCurrentScope = (tenantGlobalId: string, employeeGlobalId: string | null): void => {
    runInAction(() => {
      this.currentTenantGlobalId = tenantGlobalId;
      this.currentWorkEmployeeGlobalId = employeeGlobalId;
    });
    writeCurrentTenantGlobalId(tenantGlobalId);
    writeCurrentWorkEmployeeGlobalId(employeeGlobalId);
  };

  clear = (): void => {
    deleteCurrentTenantGlobalId();
    deleteCurrentWorkEmployeeGlobalId();
    runInAction(() => {
      this.requestVersion += 1;
      this.tenants = [];
      this.currentTenantGlobalId = null;
      this.currentWorkEmployeeGlobalId = null;
      this.hasLoaded = false;
    });
  };

  private replaceTenant = (tenant: Tenant): void => {
    runInAction(() => {
      this.tenants = this.tenants.map((existingTenant) =>
        existingTenant.globalId === tenant.globalId ? tenant : existingTenant,
      );
      this.hasLoaded = true;
    });
  };
}
