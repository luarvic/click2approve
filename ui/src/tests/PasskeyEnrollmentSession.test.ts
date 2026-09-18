import { getUserAccountManageInfo, loginUser } from "@/features/identity/api/authApi";
import { signInWithPasskey } from "@/features/identity/api/passkeysApi";
import { Credentials } from "@/features/identity/models/credentials";
import { UserAccountStore } from "@/features/identity/stores/userAccountStore";
import { beforeEach, expect, test, vi } from "vitest";

vi.mock("@/features/identity/api/authApi", () => ({
  getUserAccountManageInfo: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  requestUserPasswordReset: vi.fn(),
  resendUserConfirmationEmail: vi.fn(),
  resetUserPassword: vi.fn(),
}));
vi.mock("@/features/identity/api/passkeysApi", () => ({ signInWithPasskey: vi.fn() }));
vi.mock("@/shared/session/session", () => ({
  readTokens: () => ({ accessToken: "shared-access", refreshToken: "shared-refresh" }),
  deleteTokens: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(loginUser).mockResolvedValue(true);
  vi.mocked(signInWithPasskey).mockResolvedValue(true);
  vi.mocked(getUserAccountManageInfo).mockResolvedValue({ email: "person@example.com", isEmailConfirmed: true });
});

test("only the tab that signs in can prompt; refresh and shared-session restoration cannot", async () => {
  const initiatingTab = new UserAccountStore();
  const otherTab = new UserAccountStore();
  await initiatingTab.signIn(new Credentials("person@example.com", "Password1!"));
  expect(initiatingTab.passkeyEnrollmentPending).toBe(true);
  await otherTab.synchronizeWithSharedSession();
  expect(otherTab.currentUser?.email).toBe("person@example.com");
  expect(otherTab.passkeyEnrollmentPending).toBe(false);
  const refreshedTab = new UserAccountStore();
  await refreshedTab.signInWithCachedToken();
  expect(refreshedTab.currentUser?.email).toBe("person@example.com");
  expect(refreshedTab.passkeyEnrollmentPending).toBe(false);
});

test("MFA does not trigger the prompt until verification completes in this tab", async () => {
  const challenge = {
    requiresTwoFactor: true as const,
    challengeId: "challenge",
    trustedDeviceDays: 30,
    expiresAt: new Date().toISOString(),
    resendAfter: new Date().toISOString(),
  };
  vi.mocked(loginUser).mockResolvedValue(challenge);
  const store = new UserAccountStore();
  expect(await store.signIn(new Credentials("person@example.com", "Password1!"))).toEqual(challenge);
  expect(store.passkeyEnrollmentPending).toBe(false);
  await store.signInWithCachedToken({ promptForPasskey: true });
  expect(store.passkeyEnrollmentPending).toBe(true);
  store.completePasskeyEnrollmentPrompt();
  expect(store.passkeyEnrollmentPending).toBe(false);
  await store.synchronizeWithSharedSession();
  expect(store.passkeyEnrollmentPending).toBe(false);
});

test("passkey sign-in and unsuccessful password sign-in do not prompt", async () => {
  const store = new UserAccountStore();
  await store.signInWithPasskey();
  expect(store.passkeyEnrollmentPending).toBe(false);
  vi.mocked(loginUser).mockResolvedValue(false);
  expect(await store.signIn(new Credentials("person@example.com", "wrong"))).toBe(false);
  expect(store.passkeyEnrollmentPending).toBe(false);
});

test("signing out clears eligibility and a later explicit sign-in can prompt again", async () => {
  const store = new UserAccountStore();
  await store.signIn(new Credentials("person@example.com", "Password1!"));
  store.signOut();
  expect(store.passkeyEnrollmentPending).toBe(false);
  await store.signIn(new Credentials("person@example.com", "Password1!"));
  expect(store.passkeyEnrollmentPending).toBe(true);
});
