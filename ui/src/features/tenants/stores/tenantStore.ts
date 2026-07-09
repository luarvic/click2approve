import * as tenantApi from "@/features/tenants/api/tenantApi";
import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import {
  deleteCurrentTenantId,
  readCurrentTenantId,
  writeCurrentTenantId,
} from "@/shared/session/session";
import { makeAutoObservable, runInAction } from "mobx";

export class TenantStore {
  tenants: Tenant[];
  currentTenantId: number | null;
  hasLoaded: boolean;

  constructor(
    tenants: Tenant[] = [],
    currentTenantId: number | null = readCurrentTenantId(),
    hasLoaded: boolean = false
  ) {
    this.tenants = tenants;
    this.currentTenantId = currentTenantId;
    this.hasLoaded = hasLoaded;
    makeAutoObservable(this);
  }

  get currentTenant(): Tenant | null {
    return this.tenants.find((tenant) => tenant.id === this.currentTenantId) ?? null;
  }

  load = async (): Promise<void> => {
    const tenants = await tenantApi.listTenants();
    const cachedTenantId = readCurrentTenantId();
    const currentTenant =
      tenants.find((tenant) => tenant.id === cachedTenantId) ?? tenants[0] ?? null;
    runInAction(() => {
      this.tenants = tenants;
      this.currentTenantId = currentTenant?.id ?? null;
      this.hasLoaded = true;
    });
    if (currentTenant) {
      writeCurrentTenantId(currentTenant.id);
    } else {
      deleteCurrentTenantId();
    }
  };

  create = async (payload: CreateTenantRequest): Promise<Tenant | null> => {
    const tenant = await tenantApi.createTenant(payload);
    if (!tenant) {
      return null;
    }

    runInAction(() => {
      this.tenants = [...this.tenants, tenant];
      this.currentTenantId = tenant.id;
      this.hasLoaded = true;
    });
    writeCurrentTenantId(tenant.id);
    return tenant;
  };

  createWithLogo = async (
    payload: CreateTenantRequest,
    logo: File
  ): Promise<Tenant | null> => {
    const tenant = await tenantApi.createTenantWithLogo(payload, logo);
    if (!tenant) {
      return null;
    }

    runInAction(() => {
      this.tenants = [...this.tenants, tenant];
      this.currentTenantId = tenant.id;
      this.hasLoaded = true;
    });
    writeCurrentTenantId(tenant.id);
    return tenant;
  };

  update = async (
    tenantId: number,
    payload: UpdateTenantRequest
  ): Promise<Tenant | null> => {
    const tenant = await tenantApi.updateTenant(tenantId, payload);
    if (!tenant) {
      return null;
    }

    runInAction(() => {
      this.tenants = this.tenants.map((existingTenant) =>
        existingTenant.id === tenant.id ? tenant : existingTenant
      );
      this.hasLoaded = true;
    });
    return tenant;
  };

  uploadLogo = async (tenantId: number, logo: File): Promise<boolean> => {
    const tenant = await tenantApi.uploadTenantLogo(tenantId, logo);
    if (!tenant) {
      return false;
    }

    this.replaceTenant(tenant);
    return true;
  };

  deleteLogo = async (tenantId: number): Promise<boolean> => {
    const tenant = await tenantApi.deleteTenantLogo(tenantId);
    if (!tenant) {
      return false;
    }

    this.replaceTenant(tenant);
    return true;
  };

  delete = async (tenantId: number): Promise<boolean> => {
    const deleted = await tenantApi.deleteTenant(tenantId);
    if (!deleted) {
      return false;
    }

    let currentTenantId: number | null = null;
    runInAction(() => {
      this.tenants = this.tenants.filter((tenant) => tenant.id !== tenantId);
      currentTenantId =
        this.currentTenantId === tenantId
          ? this.tenants[0]?.id ?? null
          : this.currentTenantId;
      this.currentTenantId = currentTenantId;
      this.hasLoaded = true;
    });

    if (currentTenantId) {
      writeCurrentTenantId(currentTenantId);
    } else {
      deleteCurrentTenantId();
    }

    return true;
  };

  setCurrentId = (tenantId: number): void => {
    runInAction(() => {
      this.currentTenantId = tenantId;
    });
    writeCurrentTenantId(tenantId);
  };

  clear = (): void => {
    deleteCurrentTenantId();
    runInAction(() => {
      this.tenants = [];
      this.currentTenantId = null;
      this.hasLoaded = false;
    });
  };

  private replaceTenant = (tenant: Tenant): void => {
    runInAction(() => {
      this.tenants = this.tenants.map((existingTenant) =>
        existingTenant.id === tenant.id ? tenant : existingTenant
      );
      this.hasLoaded = true;
    });
  };
}
