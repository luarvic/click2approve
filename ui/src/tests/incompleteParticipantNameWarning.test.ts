import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import { TenantType } from "@/features/tenants/models/tenant";
import { describe, expect, test } from "vitest";

describe("getIncompleteParticipantNameWarning", () => {
  test("explains the fallback for a personal user", () => {
    expect(getIncompleteParticipantNameWarning()).toEqual({
      message:
        "Your user name is incomplete and will appear as such on the record.",
      title: "User name is incomplete",
    });
  });

  test("explains the fallback for a business employee", () => {
    expect(getIncompleteParticipantNameWarning(TenantType.Business)).toEqual({
      message:
        "Your employee name is incomplete and will appear as such on the record.",
      title: "Employee name is incomplete",
    });
  });
});
