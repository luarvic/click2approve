import { ApprovalRequestStore } from "./approvalRequestStore";
import { CommonStore } from "./commonStore";
import { ApprovalRequestTaskStore } from "./approvalRequestTaskStore";
import { UserAccountStore } from "./userAccountStore";
import { UserFileStore } from "./userFileStore";
import { UserSettingsStore } from "./userSettingsStore";
import { ProductStore } from "./productStore";
import { TenantStore } from "./tenantStore";

class Stores {
  commonStore: CommonStore;
  userAccountStore: UserAccountStore;
  userFileStore: UserFileStore;
  approvalRequestStore: ApprovalRequestStore;
  approvalRequestTaskStore: ApprovalRequestTaskStore;
  userSettingsStore: UserSettingsStore;
  productStore: ProductStore;
  tenantStore: TenantStore;

  constructor(
    commonStore: CommonStore,
    userAccountStore: UserAccountStore,
    userFileStore: UserFileStore,
    approvalRequestStore: ApprovalRequestStore,
    approvalRequestTaskStore: ApprovalRequestTaskStore,
    userSettingsStore: UserSettingsStore,
    productStore: ProductStore,
    tenantStore: TenantStore
  ) {
    this.commonStore = commonStore;
    this.userAccountStore = userAccountStore;
    this.userFileStore = userFileStore;
    this.approvalRequestStore = approvalRequestStore;
    this.approvalRequestTaskStore = approvalRequestTaskStore;
    this.userSettingsStore = userSettingsStore;
    this.productStore = productStore;
    this.tenantStore = tenantStore;
  }
}

export const stores = new Stores(
  new CommonStore(),
  new UserAccountStore(),
  new UserFileStore(),
  new ApprovalRequestStore(),
  new ApprovalRequestTaskStore(),
  new UserSettingsStore(),
  new ProductStore(),
  new TenantStore()
);
