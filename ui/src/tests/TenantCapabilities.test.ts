import { ApplicationConfiguration } from "@/features/applicationConfiguration/models/applicationConfiguration";
import { EmployeeRole, Tenant, TenantType } from "@/features/tenants/models/tenant";
import { getTenantCapabilities } from "@/features/tenants/utils/tenantCapabilities";
import { describe, expect, test } from "vitest";

const applicationConfiguration: ApplicationConfiguration = {
  avatarImageSize: 1,
  capabilities: {
    approvalRequestRevisions: true,
    approvalStepTemplates: true,
    discussionAttachments: true,
    discussions: true,
    employeeAssignees: true,
    sharedVerificationLinks: true,
    taskAttachments: true,
    teamAssignees: true,
    tenants: true,
  },
  edition: "Business",
  logoImageSize: 1,
  requiresConfirmedEmail: true,
};

const createTenant = (type: TenantType, currentEmployeeRole?: EmployeeRole): Tenant => ({
  businessName: "Example organization",
  currentEmployeeRole: currentEmployeeRole as EmployeeRole,
  globalId: "tenant-global-id",
  type,
});

describe("getTenantCapabilities", () => {
  test("allows business members to view employee and team records without granting management access", () => {
    const capabilities = getTenantCapabilities(
      applicationConfiguration,
      createTenant(TenantType.Business, EmployeeRole.User),
    );

    expect(capabilities.canViewEmployees).toBe(true);
    expect(capabilities.canViewTeams).toBe(true);
    expect(capabilities.canManageEmployees).toBe(false);
    expect(capabilities.canManageTeams).toBe(false);
  });

  test("allows administrators to manage employee and team records", () => {
    const capabilities = getTenantCapabilities(
      applicationConfiguration,
      createTenant(TenantType.Business, EmployeeRole.Admin),
    );

    expect(capabilities.canManageEmployees).toBe(true);
    expect(capabilities.canManageTeams).toBe(true);
  });

  test("blocks business-only capabilities for personal tenants and unsupported backends", () => {
    const withoutBusinessCapabilities: ApplicationConfiguration = {
      ...applicationConfiguration,
      capabilities: {
        ...applicationConfiguration.capabilities,
        employeeAssignees: false,
        teamAssignees: false,
      },
    };

    expect(
      getTenantCapabilities(applicationConfiguration, createTenant(TenantType.Personal, EmployeeRole.Owner))
        .canViewEmployees,
    ).toBe(false);
    expect(
      getTenantCapabilities(withoutBusinessCapabilities, createTenant(TenantType.Business, EmployeeRole.Owner))
        .canViewTeams,
    ).toBe(false);
  });
});
