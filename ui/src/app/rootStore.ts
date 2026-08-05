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
import { UserPreferencesStore } from "@/shared/stores/userPreferencesStore";
import { UserProfileStore } from "@/shared/stores/userProfileStore";

export class RootStore {
  commonStore: CommonStore;
  userAccountStore: UserAccountStore;
  approvalRequestStore: ApprovalRequestStore;
  approvalRequestTaskStore: ApprovalRequestTaskStore;
  userPreferencesStore: UserPreferencesStore;
  userProfileStore: UserProfileStore;
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
    userPreferencesStore: UserPreferencesStore,
    userProfileStore: UserProfileStore,
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
    this.userPreferencesStore = userPreferencesStore;
    this.userProfileStore = userProfileStore;
    this.productStore = productStore;
    this.tenantStore = tenantStore;
    this.employeeStore = employeeStore;
    this.teamStore = teamStore;
    this.approvalStepTemplateStore = approvalStepTemplateStore;
    this.userAccountStore.configureSessionLifecycle(
      async () => {
        await this.userProfileStore.load();
        if (this.productStore.tenantsAreEnabled) {
          await this.tenantStore.load(
            this.userProfileStore.profile?.defaultTenantGlobalId
          );
        } else {
          await this.tenantStore.loadCurrent();
        }
      },
      this.clearSession,
    );
    configureRequestContext({
      onUnauthorized: this.userAccountStore.signOut,
    });
  }

  switchTenant = async (
    tenantGlobalId: string,
    loadIncomingTasks: boolean = false,
  ): Promise<void> => {
    this.tenantStore.setCurrentGlobalId(tenantGlobalId);
    await this.refreshTenantScope(loadIncomingTasks);
  };

  refreshTenantScope = async (
    loadIncomingTasks: boolean = false,
  ): Promise<void> => {
    this.clearTenantScope();
    if (!this.tenantStore.currentTenantGlobalId) {
      return;
    }
    const tenantGlobalId = this.tenantStore.currentTenantGlobalId;
    await Promise.all([
      this.approvalRequestStore.load(tenantGlobalId),
      this.approvalRequestTaskStore.loadUncompletedCount(tenantGlobalId),
      loadIncomingTasks
        ? this.approvalRequestTaskStore.loadIncoming(tenantGlobalId)
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
    this.userProfileStore.clear();
    this.commonStore.clearSessionState();
  };
}

export const stores = new RootStore(
  new CommonStore(),
  new UserAccountStore(),
  new ApprovalRequestStore(),
  new ApprovalRequestTaskStore(),
  new UserPreferencesStore(),
  new UserProfileStore(),
  new ProductStore(),
  new TenantStore(),
  new EmployeeStore(),
  new TeamStore(),
  new ApprovalStepTemplateStore()
);
