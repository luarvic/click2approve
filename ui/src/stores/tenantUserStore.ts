import { makeAutoObservable, runInAction } from "mobx";
import {
  tenantUserCreate,
  tenantUserDelete,
  tenantUserList,
  tenantUserUpdate,
} from "../lib/controllers/tenantUser";
import {
  ITenantUser,
  ITenantUserCreate,
  ITenantUserUpdate,
} from "../models/tenantUser";

export class TenantUserStore {
  tenantUsers: ITenantUser[];

  constructor(tenantUsers: ITenantUser[] = []) {
    this.tenantUsers = tenantUsers;
    makeAutoObservable(this);
  }

  load = async (tenantId: number): Promise<void> => {
    const tenantUsers = await tenantUserList(tenantId);
    runInAction(() => {
      this.tenantUsers = tenantUsers;
    });
  };

  create = async (
    tenantId: number,
    payload: ITenantUserCreate
  ): Promise<boolean> => {
    const tenantUser = await tenantUserCreate(tenantId, payload);
    if (!tenantUser) {
      return false;
    }

    runInAction(() => {
      this.tenantUsers = [...this.tenantUsers, tenantUser];
    });
    return true;
  };

  update = async (
    tenantId: number,
    tenantUserId: number,
    payload: ITenantUserUpdate
  ): Promise<boolean> => {
    const tenantUser = await tenantUserUpdate(tenantId, tenantUserId, payload);
    if (!tenantUser) {
      return false;
    }

    runInAction(() => {
      this.tenantUsers = this.tenantUsers.map((item) =>
        item.id === tenantUser.id ? tenantUser : item
      );
    });
    return true;
  };

  delete = async (tenantId: number, tenantUserId: number): Promise<boolean> => {
    if (!(await tenantUserDelete(tenantId, tenantUserId))) {
      return false;
    }

    runInAction(() => {
      this.tenantUsers = this.tenantUsers.filter(
        (tenantUser) => tenantUser.id !== tenantUserId
      );
    });
    return true;
  };

  clear = (): void => {
    runInAction(() => {
      this.tenantUsers = [];
    });
  };
}
