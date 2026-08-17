import { ApplicationConfiguration } from "@/features/applicationConfiguration/models/applicationConfiguration";
import { EmployeeRole, Tenant, TenantType } from "@/features/tenants/models/tenant";

export interface TenantCapabilities {
  canManageDelegations: boolean;
  canManageEmployees: boolean;
  canManageTeams: boolean;
  canViewDelegations: boolean;
  canViewEmployees: boolean;
  canViewTemplates: boolean;
  canViewTeams: boolean;
}

export const getTenantCapabilities = (
  applicationConfiguration: ApplicationConfiguration | null,
  tenant: Tenant | null,
): TenantCapabilities => {
  const isBusinessMember = tenant?.type === TenantType.Business && tenant.currentEmployeeRole !== undefined;
  const canManage =
    isBusinessMember &&
    (tenant.currentEmployeeRole === EmployeeRole.Admin || tenant.currentEmployeeRole === EmployeeRole.Owner);

  return {
    canManageDelegations: canManage,
    canManageEmployees: Boolean(applicationConfiguration?.capabilities.employeeAssignees) && canManage,
    canManageTeams: Boolean(applicationConfiguration?.capabilities.teamAssignees) && canManage,
    canViewDelegations: isBusinessMember,
    canViewEmployees: Boolean(applicationConfiguration?.capabilities.employeeAssignees) && isBusinessMember,
    canViewTemplates: Boolean(applicationConfiguration?.capabilities.approvalStepTemplates) && isBusinessMember,
    canViewTeams: Boolean(applicationConfiguration?.capabilities.teamAssignees) && isBusinessMember,
  };
};
