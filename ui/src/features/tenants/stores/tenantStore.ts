import * as tenantApi from "@/features/tenants/api/tenantsApi";
import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import {
  deleteCurrentTenantGlobalId,
  readCurrentTenantGlobalId,
  writeCurrentTenantGlobalId,
} from "@/shared/session/session";
import { makeAutoObservable, runInAction } from "mobx";

export class TenantStore {
  tenants: Tenant[];
  currentTenantGlobalId: string | null;
  hasLoaded: boolean;
  // Incremented to invalidate older async requests so only the latest response updates the store.
  private requestVersion = 0;

  constructor(
    tenants: Tenant[] = [],
    currentTenantGlobalId: string | null = readCurrentTenantGlobalId(),
    hasLoaded: boolean = false
  ) {
    this.tenants = tenants;
    this.currentTenantGlobalId = currentTenantGlobalId;
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
    const currentTenant =
      tenants.find((tenant) => tenant.globalId === defaultTenantGlobalId) ??
      tenants.find((tenant) => tenant.globalId === cachedTenantId) ??
      tenants[0] ??
      null;
    runInAction(() => {
      this.tenants = tenants;
      this.currentTenantGlobalId = currentTenant?.globalId ?? null;
      this.hasLoaded = true;
    });
    if (currentTenant) {
      writeCurrentTenantGlobalId(currentTenant.globalId);
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

  createWithLogo = async (
    payload: CreateTenantRequest,
    logo: File
  ): Promise<Tenant | null> => {
    const requestVersion = this.requestVersion;
    const tenant = await tenantApi.createTenantWithLogo(payload, logo);
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

  update = async (
    tenantGlobalId: string,
    payload: UpdateTenantRequest
  ): Promise<Tenant | null> => {
    const requestVersion = this.requestVersion;
    const tenant = await tenantApi.updateTenant(tenantGlobalId, payload);
    if (!tenant || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.tenants = this.tenants.map((existingTenant) =>
        existingTenant.globalId === tenant.globalId ? tenant : existingTenant
      );
      this.hasLoaded = true;
    });
    return tenant;
  };

  uploadLogo = async (tenantGlobalId: string, logo: File): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    const tenant = await tenantApi.uploadTenantLogo(tenantGlobalId, logo);
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

  delete = async (tenantGlobalId: string): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    const deleted = await tenantApi.deleteTenant(tenantGlobalId);
    if (!deleted || requestVersion !== this.requestVersion) {
      return false;
    }

    let currentTenantGlobalId: string | null = null;
    runInAction(() => {
      this.tenants = this.tenants.filter((tenant) => tenant.globalId !== tenantGlobalId);
      currentTenantGlobalId =
        this.currentTenantGlobalId === tenantGlobalId
          ? this.tenants[0]?.globalId ?? null
          : this.currentTenantGlobalId;
      this.currentTenantGlobalId = currentTenantGlobalId;
      this.hasLoaded = true;
    });

    if (currentTenantGlobalId) {
      writeCurrentTenantGlobalId(currentTenantGlobalId);
    } else {
      deleteCurrentTenantGlobalId();
    }

    return true;
  };

  setCurrentGlobalId = (tenantGlobalId: string): void => {
    runInAction(() => {
      this.currentTenantGlobalId = tenantGlobalId;
    });
    writeCurrentTenantGlobalId(tenantGlobalId);
  };

  clear = (): void => {
    deleteCurrentTenantGlobalId();
    runInAction(() => {
      this.requestVersion += 1;
      this.tenants = [];
      this.currentTenantGlobalId = null;
      this.hasLoaded = false;
    });
  };

  private replaceTenant = (tenant: Tenant): void => {
    runInAction(() => {
      this.tenants = this.tenants.map((existingTenant) =>
        existingTenant.globalId === tenant.globalId ? tenant : existingTenant
      );
      this.hasLoaded = true;
    });
  };
}
