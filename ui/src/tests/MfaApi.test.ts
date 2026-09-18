import { loginUser } from "@/features/identity/api/authApi";
import { manageTwoFactor } from "@/features/identity/api/mfaApi";
import { Credentials } from "@/features/identity/models/credentials";
import { ApiPaths } from "@/shared/api/apiPaths";
import axios from "@/shared/api/axios";
import { writeTokens } from "@/shared/session/session";
import { notification } from "@/shared/utils/notifications";
import { AxiosError, AxiosResponse } from "axios";
import { beforeEach, expect, test, vi } from "vitest";

vi.mock("@/shared/api/axios", () => ({ default: { post: vi.fn() } }));
vi.mock("@/shared/session/session", () => ({ writeTokens: vi.fn() }));
vi.mock("@/shared/utils/notifications", () => ({ notification: { error: vi.fn() } }));
const credentials = new Credentials("person@example.com", "Password1!");
beforeEach(() => vi.clearAllMocks());

test("recognizes Identity's MFA-required response without creating a session or showing an error", async () => {
  vi.mocked(axios.post).mockRejectedValue(
    new AxiosError("Unauthorized", undefined, undefined, undefined, {
      status: 401,
      data: { detail: "RequiresTwoFactor" },
    } as AxiosResponse),
  );
  expect(await loginUser(credentials)).toEqual({ requiresTwoFactor: true });
  expect(writeTokens).not.toHaveBeenCalled();
  expect(notification.error).not.toHaveBeenCalled();
});

test.each([{ twoFactorCode: "012345" }, { twoFactorRecoveryCode: "ABCDE-12345" }])(
  "uses native login for %j",
  async (factor) => {
    const tokens = { accessToken: "access", refreshToken: "refresh" };
    vi.mocked(axios.post).mockResolvedValue({ data: tokens });
    expect(await loginUser(credentials, factor)).toBe(true);
    expect(axios.post).toHaveBeenCalledWith(ApiPaths.account.login, {
      email: credentials.email,
      password: credentials.password,
      ...factor,
    });
    expect(writeTokens).toHaveBeenCalledWith(tokens);
  },
);

test("does not mistake an invalid code for an MFA challenge", async () => {
  vi.mocked(axios.post).mockRejectedValue(
    new AxiosError("Unauthorized", undefined, undefined, undefined, {
      status: 401,
      data: { detail: "Failed" },
    } as AxiosResponse),
  );
  expect(await loginUser(credentials, { twoFactorCode: "000000" })).toBe(false);
  expect(writeTokens).not.toHaveBeenCalled();
  expect(notification.error).toHaveBeenCalledOnce();
});

test("uses native authenticator management without treating its response as session tokens", async () => {
  const result = { sharedKey: "SECRET", isTwoFactorEnabled: true, recoveryCodes: ["recovery"] };
  vi.mocked(axios.post).mockResolvedValue({ data: result });
  expect(await manageTwoFactor({ enable: true, twoFactorCode: "012345" })).toEqual(result);
  expect(axios.post).toHaveBeenCalledWith(ApiPaths.account.manageTwoFactor, { enable: true, twoFactorCode: "012345" });
  expect(writeTokens).not.toHaveBeenCalled();
});
