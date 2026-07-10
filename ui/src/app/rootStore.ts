import { ApprovalRequestStore } from "@/features/approvalRequests/stores/approvalRequestStore";
import { ApprovalRequestTaskStore } from "@/features/approvalRequests/stores/approvalRequestTaskStore";
import { ApprovalStepTemplateStore } from "@/features/approvalStepTemplates/stores/approvalStepTemplateStore";
import { EmployeeStore } from "@/features/employees/stores/employeeStore";
import { UserAccountStore } from "@/features/identity/stores/userAccountStore";
import { ProductStore } from "@/features/product/stores/productStore";
import { TeamStore } from "@/features/teams/stores/teamStore";
import { TenantStore } from "@/features/tenants/stores/tenantStore";
import { configureRequestContext } from "@/shared/api/requestContext";
import { CommonStore } from "@/shared/stores/commonStore";
import { UserSettingsStore } from "@/shared/stores/userSettingsStore";

export class RootStore {
  commonStore: CommonStore;
  userAccountStore: UserAccountStore;
  approvalRequestStore: ApprovalRequestStore;
  approvalRequestTaskStore: ApprovalRequestTaskStore;
  userSettingsStore: UserSettingsStore;
  productStore: ProductStore;
  tenantStore: TenantStore;
  employeeStore: EmployeeStore;
  teamStore: TeamStore;
  approvalStepTemplateStore: ApprovalStepTemplateStore;

  constructor(
    commonStore: CommonStore,
    userAccountStore: UserAccountStore,
    approvalRequestStore: ApprovalRequestStore,
    approvalRequestTaskStore: ApprovalRequestTaskStore,
    userSettingsStore: UserSettingsStore,
    productStore: ProductStore,
    tenantStore: TenantStore,
    employeeStore: EmployeeStore,
    teamStore: TeamStore,
    approvalStepTemplateStore: ApprovalStepTemplateStore
  ) {
    this.commonStore = commonStore;
    this.userAccountStore = userAccountStore;
    this.approvalRequestStore = approvalRequestStore;
    this.approvalRequestTaskStore = approvalRequestTaskStore;
    this.userSettingsStore = userSettingsStore;
    this.productStore = productStore;
    this.tenantStore = tenantStore;
    this.employeeStore = employeeStore;
    this.teamStore = teamStore;
    this.approvalStepTemplateStore = approvalStepTemplateStore;
    this.userAccountStore.configureSessionLifecycle(
      async () => {
        if (this.productStore.tenantsAreEnabled) {
          await this.tenantStore.load();
        }
      },
      this.clearSession,
    );
    configureRequestContext({
      getCurrentTenantId: () => this.tenantStore.currentTenantId,
      onLoadingChange: this.commonStore.updateLoadingCounter,
      onUnauthorized: this.userAccountStore.signOut,
      tenantsAreEnabled: () => this.productStore.tenantsAreEnabled,
    });
  }

  switchTenant = async (
    tenantId: number,
    loadIncomingTasks: boolean = false,
  ): Promise<void> => {
    this.tenantStore.setCurrentId(tenantId);
    await this.refreshTenantScope(loadIncomingTasks);
  };

  refreshTenantScope = async (
    loadIncomingTasks: boolean = false,
  ): Promise<void> => {
    this.clearTenantScope();
    if (!this.tenantStore.currentTenantId) {
      return;
    }
    await Promise.all([
      this.approvalRequestStore.load(),
      this.approvalRequestTaskStore.loadUncompletedCount(),
      loadIncomingTasks
        ? this.approvalRequestTaskStore.loadIncoming()
        : Promise.resolve(),
    ]);
  };

  clearTenantScope = (): void => {
    this.approvalRequestStore.reset();
    this.approvalRequestTaskStore.reset();
    this.employeeStore.clear();
    this.teamStore.clear();
    this.approvalStepTemplateStore.clear();
  };

  clearSession = (): void => {
    this.clearTenantScope();
    this.tenantStore.clear();
    this.commonStore.clearSessionState();
  };
}

export const stores = new RootStore(
  new CommonStore(),
  new UserAccountStore(),
  new ApprovalRequestStore(),
  new ApprovalRequestTaskStore(),
  new UserSettingsStore(),
  new ProductStore(),
  new TenantStore(),
  new EmployeeStore(),
  new TeamStore(),
  new ApprovalStepTemplateStore()
);
