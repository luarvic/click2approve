import { getEmployeeDisplayName } from "@/shared/utils/displayNameHelpers";
import { describe, expect, test } from "vitest";

describe("getEmployeeDisplayName", () => {
  test("formats an employee name and position", () => {
    expect(
      getEmployeeDisplayName({
        email: "employee@example.com",
        firstName: "  Employee",
        lastName: "Name ",
        position: " Manager ",
      }),
    ).toBe("Employee Name, Manager");
  });

  test("uses the email when employee details are unavailable", () => {
    expect(getEmployeeDisplayName({ email: " Employee@Example.COM " })).toBe("employee@example.com");
  });

  test("uses an unknown employee label when employee details are unavailable", () => {
    expect(getEmployeeDisplayName()).toBe("Unknown employee");
  });
});
