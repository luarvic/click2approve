import { getUserAccountManageInfo } from "@/features/identity/api/authApi";
import { rememberReturnUrl } from "@/features/identity/routing/returnUrl";
import { UserAccountStore } from "@/features/identity/stores/userAccountStore";
import { writeTokens } from "@/shared/session/session";
import { beforeEach, expect, test, vi } from "vitest";

vi.mock("@/features/identity/api/authApi", () => ({
  getUserAccountManageInfo: vi.fn(),
}));
vi.mock("@/features/identity/api/passkeysApi", () => ({}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

test("a rejected cached session suppresses return navigation and discards the old destination", async () => {
  writeTokens({ tokenType: "Bearer", accessToken: "old-access", refreshToken: "old-refresh", expiresIn: 3600 });
  rememberReturnUrl("/tenants/deleted/tasks");
  vi.mocked(getUserAccountManageInfo).mockResolvedValue(null);
  const store = new UserAccountStore();

  expect(await store.signInWithCachedToken()).toBe(false);
  expect(store.currentUser).toBeNull();
  expect(store.isSessionSignOut).toBe(true);
  expect(localStorage.getItem("authenticationReturnUrl")).toBeNull();
});

test("anonymous startup preserves a pending deep link", async () => {
  rememberReturnUrl("/tenants/current/tasks/task");
  const store = new UserAccountStore();

  expect(await store.signInWithCachedToken()).toBe(false);
  expect(store.currentUser).toBeNull();
  expect(store.isSessionSignOut).toBe(false);
  expect(localStorage.getItem("authenticationReturnUrl")).not.toBeNull();
  expect(getUserAccountManageInfo).not.toHaveBeenCalled();
});

test("automatic sign-out clears a pending destination and allows a later anonymous link", () => {
  rememberReturnUrl("/tenants/deleted/tasks");
  const store = new UserAccountStore({ email: "person@example.com", isEmailConfirmed: true });
  store.signOut();
  expect(store.isSessionSignOut).toBe(true);
  expect(localStorage.getItem("authenticationReturnUrl")).toBeNull();
  store.clearSessionSignOut();
  expect(store.isSessionSignOut).toBe(false);
});
