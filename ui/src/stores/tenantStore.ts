import { makeAutoObservable, runInAction } from "mobx";
import {
  tenantCreate,
  tenantDelete,
  tenantList,
  tenantUpdate,
} from "../lib/controllers/tenant";
import {
  deleteCurrentTenantId,
  readCurrentTenantId,
  writeCurrentTenantId,
} from "../lib/session";
import { ITenant, ITenantCreate, ITenantUpdate } from "../models/tenant";

export class TenantStore {
  tenants: ITenant[];
  currentTenantId: number | null;
  hasLoaded: boolean;

  constructor(
    tenants: ITenant[] = [],
    currentTenantId: number | null = readCurrentTenantId(),
    hasLoaded: boolean = false
  ) {
    this.tenants = tenants;
    this.currentTenantId = currentTenantId;
    this.hasLoaded = hasLoaded;
    makeAutoObservable(this);
  }

  get currentTenant(): ITenant | null {
    return this.tenants.find((tenant) => tenant.id === this.currentTenantId) ?? null;
  }

  load = async (): Promise<void> => {
    const tenants = await tenantList();
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

  create = async (payload: ITenantCreate): Promise<boolean> => {
    const tenant = await tenantCreate(payload);
    if (!tenant) {
      return false;
    }

    runInAction(() => {
      this.tenants = [...this.tenants, tenant];
      this.currentTenantId = tenant.id;
      this.hasLoaded = true;
    });
    writeCurrentTenantId(tenant.id);
    return true;
  };

  update = async (
    tenantId: number,
    payload: ITenantUpdate
  ): Promise<boolean> => {
    const tenant = await tenantUpdate(tenantId, payload);
    if (!tenant) {
      return false;
    }

    runInAction(() => {
      this.tenants = this.tenants.map((existingTenant) =>
        existingTenant.id === tenant.id ? tenant : existingTenant
      );
      this.hasLoaded = true;
    });
    return true;
  };

  delete = async (tenantId: number): Promise<boolean> => {
    const deleted = await tenantDelete(tenantId);
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

  setCurrentTenantId = (tenantId: number): void => {
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
}
