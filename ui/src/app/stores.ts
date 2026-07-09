import { ApprovalRequestStore } from "@/features/approvalRequests/stores/approvalRequestStore";
import { ApprovalRequestTaskStore } from "@/features/approvalRequests/stores/approvalRequestTaskStore";
import { ApprovalStepTemplateStore } from "@/features/approvalStepTemplates/stores/approvalStepTemplateStore";
import { EmployeeStore } from "@/features/employees/stores/employeeStore";
import { UserAccountStore } from "@/features/identity/stores/userAccountStore";
import { ProductStore } from "@/features/product/stores/productStore";
import { TeamStore } from "@/features/teams/stores/teamStore";
import { TenantStore } from "@/features/tenants/stores/tenantStore";
import { CommonStore } from "@/shared/stores/commonStore";
import { UserSettingsStore } from "@/shared/stores/userSettingsStore";

class Stores {
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
  }
}

export const stores = new Stores(
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
