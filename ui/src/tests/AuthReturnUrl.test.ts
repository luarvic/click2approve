import {
  authPath,
  clearReachedReturnUrl,
  getAuthReturnUrl,
  rememberReturnUrl,
  validateReturnUrl,
} from "@/features/identity/routing/returnUrl";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const destination = "/tenants/tenant-a/tasks/task-a?view=hello%20world#discussion";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("authentication return destinations", () => {
  test("retains the tenant, resource, query, and fragment", () => {
    expect(validateReturnUrl(destination)).toBe(destination);
    const signIn = authPath("/signIn", destination);
    expect(getAuthReturnUrl(signIn.slice(signIn.indexOf("?")))).toBe(destination);
  });

  test.each([
    "/a/..//evil.example",
    "/a/../%2fevil.example",
    "https://evil.example/path",
    "//evil.example",
    "/\\evil.example",
    "/%2fevil.example",
    "/%5cevil.example",
    "/signIn",
    "/SIGNIN/",
    "/%73ignIn",
    "/a/../signUp",
    "/confirmEmail?code=secret",
    "javascript:alert(1)",
    "/%0aevil",
    "/%",
  ])("rejects unsafe or looping destination %s", (value) => {
    expect(validateReturnUrl(value)).toBeNull();
  });

  test("survives confirmation in another tab and is cleared only after reaching the destination", () => {
    rememberReturnUrl(destination);
    expect(getAuthReturnUrl("")).toBe(destination);
    clearReachedReturnUrl("/userProfile");
    expect(getAuthReturnUrl("")).toBe(destination);
    clearReachedReturnUrl(destination);
    expect(getAuthReturnUrl("")).toBe("/");
  });

  test("explicit destinations override saved ones and invalid parameters cannot redirect externally", () => {
    rememberReturnUrl(destination);
    expect(getAuthReturnUrl("?returnUrl=%2FuserProfile")).toBe("/userProfile");
    expect(getAuthReturnUrl("?returnUrl=https%3A%2F%2Fevil.example")).toBe("/");
  });

  test("expires abandoned destinations", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    rememberReturnUrl(destination);
    vi.mocked(Date.now).mockReturnValue(now + 24 * 60 * 60 * 1000 + 1);
    expect(getAuthReturnUrl("")).toBe("/");
  });
});
