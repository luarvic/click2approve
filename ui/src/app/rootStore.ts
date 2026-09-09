import { ApprovalRequestStore } from "@/features/approvalRequests/stores/approvalRequestStore";
import { ApprovalRequestTaskStore } from "@/features/approvalRequests/stores/approvalRequestTaskStore";
import { ApprovalStepTemplateStore } from "@/features/approvalStepTemplates/stores/approvalStepTemplateStore";
import { ApplicationConfigurationStore } from "@/features/applicationConfiguration/stores/applicationConfigurationStore";
import { EmployeeStore } from "@/features/employees/stores/employeeStore";
import { UserAccountStore } from "@/features/identity/stores/userAccountStore";
import { NotificationStore } from "@/features/notifications/stores/notificationStore";
import { BillingAccessStore } from "@/features/subscriptions/stores/billingAccessStore";
import { TeamStore } from "@/features/teams/stores/teamStore";
import { TenantStore } from "@/features/tenants/stores/tenantStore";
import { configureRequestContext } from "@/shared/api/requestContext";
import { CommonStore } from "@/shared/stores/commonStore";
import { UserPreferencesStore } from "@/shared/stores/userPreferencesStore";
import { UserProfileStore } from "@/shared/stores/userProfileStore";

const getTenantGlobalIdFromCurrentPath = (): string | undefined =>
  window.location.pathname.match(/(?:^|\/)tenants\/([^/]+)/)?.[1];

export class RootStore {
  readonly billingAccessStore: BillingAccessStore;
  readonly commonStore: CommonStore;
  readonly userAccountStore: UserAccountStore;
  readonly approvalRequestStore: ApprovalRequestStore;
  readonly approvalRequestTaskStore: ApprovalRequestTaskStore;
  readonly userPreferencesStore: UserPreferencesStore;
  readonly userProfileStore: UserProfileStore;
  readonly applicationConfigurationStore: ApplicationConfigurationStore;
  readonly tenantStore: TenantStore;
  readonly employeeStore: EmployeeStore;
  readonly teamStore: TeamStore;
  readonly approvalStepTemplateStore: ApprovalStepTemplateStore;
  readonly notificationStore: NotificationStore;
  private workEmployeeInvalidRecovery: Promise<void> | null = null;

  constructor(
    commonStore: CommonStore,
    userAccountStore: UserAccountStore,
    approvalRequestStore: ApprovalRequestStore,
    approvalRequestTaskStore: ApprovalRequestTaskStore,
    userPreferencesStore: UserPreferencesStore,
    userProfileStore: UserProfileStore,
    applicationConfigurationStore: ApplicationConfigurationStore,
    tenantStore: TenantStore,
    employeeStore: EmployeeStore,
    teamStore: TeamStore,
    approvalStepTemplateStore: ApprovalStepTemplateStore,
    notificationStore: NotificationStore,
    billingAccessStore: BillingAccessStore,
  ) {
    this.billingAccessStore = billingAccessStore;
    this.commonStore = commonStore;
    this.userAccountStore = userAccountStore;
    this.approvalRequestStore = approvalRequestStore;
    this.approvalRequestTaskStore = approvalRequestTaskStore;
    this.userPreferencesStore = userPreferencesStore;
    this.userProfileStore = userProfileStore;
    this.applicationConfigurationStore = applicationConfigurationStore;
    this.tenantStore = tenantStore;
    this.employeeStore = employeeStore;
    this.teamStore = teamStore;
    this.approvalStepTemplateStore = approvalStepTemplateStore;
    this.notificationStore = notificationStore;
    this.userAccountStore.configureSessionLifecycle(async () => {
      await this.userProfileStore.load();
      if (this.applicationConfigurationStore.tenantsAreEnabled) {
        await this.tenantStore.load(
          this.userProfileStore.profile?.defaultTenantGlobalId,
          getTenantGlobalIdFromCurrentPath(),
        );
      } else {
        await this.tenantStore.loadCurrent();
      }
    }, this.clearSession);
    configureRequestContext({
      getWorkEmployeeGlobalId: () => this.tenantStore.currentWorkEmployeeGlobalId,
      onWorkEmployeeInvalid: this.recoverInvalidWorkEmployee,
      onUnauthorized: this.userAccountStore.signOut,
      onTenantSuspended: (tenantGlobalId) => {
        this.billingAccessStore.block(tenantGlobalId);
        if (this.tenantStore.currentTenantGlobalId === tenantGlobalId) this.clearTenantScope();
      },
    });
  }

  switchTenant = async (
    tenantGlobalId: string,
    employeeGlobalId: string | null = null,
    loadIncomingTasks: boolean = false,
  ): Promise<void> => {
    this.tenantStore.setCurrentScope(tenantGlobalId, employeeGlobalId);
    await this.refreshTenantScope(loadIncomingTasks);
  };

  refreshTenantScope = async (loadIncomingTasks: boolean = false): Promise<void> => {
    this.clearTenantScope();
    if (!this.tenantStore.currentTenantGlobalId) {
      return;
    }
    const tenantGlobalId = this.tenantStore.currentTenantGlobalId;
    await Promise.all([
      this.approvalRequestStore.load(tenantGlobalId),
      this.approvalRequestTaskStore.loadUncompletedCount(tenantGlobalId),
      loadIncomingTasks ? this.approvalRequestTaskStore.loadIncoming(tenantGlobalId) : Promise.resolve(),
    ]);
  };

  private recoverInvalidWorkEmployee = (): Promise<void> => {
    if (this.workEmployeeInvalidRecovery) {
      return this.workEmployeeInvalidRecovery;
    }

    const recovery = (async () => {
      await this.tenantStore.load();
      await this.refreshTenantScope();
    })().finally(() => {
      this.workEmployeeInvalidRecovery = null;
    });
    this.workEmployeeInvalidRecovery = recovery;
    return recovery;
  };

  clearTenantScope = (): void => {
    this.approvalRequestStore.reset();
    this.approvalRequestTaskStore.reset();
    this.notificationStore.reset();
    this.employeeStore.clear();
    this.teamStore.clear();
    this.approvalStepTemplateStore.clear();
  };

  clearSession = (): void => {
    this.billingAccessStore.clear();
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
  new ApplicationConfigurationStore(),
  new TenantStore(),
  new EmployeeStore(),
  new TeamStore(),
  new ApprovalStepTemplateStore(),
  new NotificationStore(),
  new BillingAccessStore(),
);
