import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import { TenantType } from "@/features/tenants/models/tenant";
import { describe, expect, test } from "vitest";

describe("getIncompleteParticipantNameWarning", () => {
  test("does not show a warning for a personal user", () => {
    expect(getIncompleteParticipantNameWarning()).toBeUndefined();
    expect(getIncompleteParticipantNameWarning(TenantType.Personal)).toBeUndefined();
  });

  test("explains the fallback for a business employee", () => {
    expect(getIncompleteParticipantNameWarning(TenantType.Business)).toEqual({
      message: "Your employee name is incomplete and will appear as such on the record.",
      title: "Employee name is incomplete",
    });
  });
});
