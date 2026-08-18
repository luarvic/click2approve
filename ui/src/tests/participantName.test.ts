import {
  getParticipantName,
  hasIncompleteBusinessParticipantName,
} from "@/features/approvalRequests/utils/participantName";
import { EmployeeRole, Tenant, TenantType } from "@/features/tenants/models/tenant";
import { UserProfile } from "@/shared/models/userProfile";
import { describe, expect, test } from "vitest";

const businessTenant: Tenant = {
  businessName: "Business",
  currentEmployeeFirstName: "Employee",
  currentEmployeeLastName: "Name",
  currentEmployeeRole: EmployeeRole.User,
  globalId: "tenant-id",
  type: TenantType.Business,
};
const profile: UserProfile = {
  firstName: "User",
  lastName: "Name",
  notificationPreferences: [],
};

describe("participant name", () => {
  test("uses employee details for business submissions", () => {
    expect(getParticipantName(businessTenant, profile)).toEqual({ firstName: "Employee", lastName: "Name" });
    expect(hasIncompleteBusinessParticipantName(businessTenant, profile)).toBe(false);
  });

  test("requires both employee name parts for business submissions", () => {
    expect(hasIncompleteBusinessParticipantName({ ...businessTenant, currentEmployeeFirstName: " " }, profile)).toBe(
      true,
    );
  });

  test("does not require employee details for personal submissions", () => {
    expect(
      hasIncompleteBusinessParticipantName(
        { ...businessTenant, currentEmployeeFirstName: undefined, type: TenantType.Personal },
        profile,
      ),
    ).toBe(false);
  });
});
