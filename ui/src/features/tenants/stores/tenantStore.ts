import * as tenantApi from "@/features/tenants/api/tenantsApi";
import { CreateTenantRequest, Tenant, TenantListItem, UpdateTenantRequest } from "@/features/tenants/models/tenant";
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
  businessTenants: TenantListItem[] = [];
  tenants: Tenant[];
  currentTenantGlobalId: string | null;
  currentWorkEmployeeGlobalId: string | null;
  hasLoaded: boolean;
  private businessTenantRequestVersion = 0;
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

  load = async (defaultTenantGlobalId?: string, preferredTenantGlobalId?: string): Promise<void> => {
    const requestVersion = ++this.requestVersion;
    const tenants = await tenantApi.listTenantPicker();
    if (requestVersion !== this.requestVersion) {
      return;
    }
    const cachedTenantId = readCurrentTenantGlobalId();
    const cachedWorkEmployeeGlobalId = readCurrentWorkEmployeeGlobalId();
    const currentTenant =
      tenants.find((tenant) => tenant.globalId === preferredTenantGlobalId) ??
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

  loadBusinessTenants = async (): Promise<void> => {
    const requestVersion = ++this.businessTenantRequestVersion;
    const businessTenants = await tenantApi.listTenants();
    if (requestVersion !== this.businessTenantRequestVersion) {
      return;
    }

    runInAction(() => {
      this.businessTenants = businessTenants;
    });
  };

  create = async (payload: CreateTenantRequest, select: boolean = true): Promise<Tenant | null> => {
    const requestVersion = this.requestVersion;
    const tenant = await tenantApi.createTenant(payload);
    if (!tenant || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.tenants = [...this.tenants, tenant];
      if (select) {
        this.currentTenantGlobalId = tenant.globalId;
        this.currentWorkEmployeeGlobalId = tenant.currentEmployeeGlobalId ?? null;
      }
      this.hasLoaded = true;
    });
    if (select) {
      writeCurrentTenantGlobalId(tenant.globalId);
      writeCurrentWorkEmployeeGlobalId(this.currentWorkEmployeeGlobalId);
    }
    return tenant;
  };

  createWithLogo = async (payload: CreateTenantRequest, logo: File, select: boolean = true): Promise<Tenant | null> => {
    const requestVersion = this.requestVersion;
    const tenant = await tenantApi.createTenantWithLogo(payload, logo);
    if (!tenant || requestVersion !== this.requestVersion) {
      return null;
    }

    runInAction(() => {
      this.tenants = [...this.tenants, tenant];
      if (select) {
        this.currentTenantGlobalId = tenant.globalId;
        this.currentWorkEmployeeGlobalId = tenant.currentEmployeeGlobalId ?? null;
      }
      this.hasLoaded = true;
    });
    if (select) {
      writeCurrentTenantGlobalId(tenant.globalId);
      writeCurrentWorkEmployeeGlobalId(this.currentWorkEmployeeGlobalId);
    }
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

  scheduleDeletion = async (tenantGlobalId: string): Promise<boolean> => {
    const requestVersion = this.requestVersion;
    if (!(await tenantApi.scheduleTenantDeletion(tenantGlobalId)) || requestVersion !== this.requestVersion) {
      return false;
    }

    await Promise.all([this.load(), this.loadBusinessTenants()]);
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
      this.businessTenantRequestVersion += 1;
      this.tenants = [];
      this.businessTenants = [];
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
