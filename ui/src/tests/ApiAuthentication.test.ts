import { refreshAuthSession } from "@/features/identity/api/authApi";
import type { AuthResponse } from "@/features/identity/models/authResponse";
import api from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { configureRequestContext } from "@/shared/api/requestContext";
import { deleteTokens, readTokens, writeTokens } from "@/shared/session/session";
import { AxiosError, AxiosHeaders, type AxiosAdapter } from "axios";
import { beforeEach, expect, test, vi } from "vitest";

vi.mock("@/features/identity/api/authApi", () => ({ refreshAuthSession: vi.fn() }));

const tokens = (suffix: string): AuthResponse => ({
  tokenType: "Bearer",
  accessToken: `access-${suffix}`,
  refreshToken: `refresh-${suffix}`,
  expiresIn: 3600,
});
const onUnauthorized = vi.fn();
const onTenantAccessRevoked = vi.fn();
const onWorkEmployeeInvalid = vi.fn();
let employee: string | null;

beforeEach(() => {
  localStorage.clear();
  vi.resetAllMocks();
  employee = "employee-a";
  writeTokens(tokens("old"));
  configureRequestContext({
    getWorkEmployeeGlobalId: () => employee,
    onUnauthorized,
    onTenantAccessRevoked,
    onWorkEmployeeInvalid,
    onTenantSuspended: vi.fn(),
  });
});

const reject: AxiosAdapter = async (config) => {
  throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, {
    config,
    data: {},
    status: 401,
    statusText: "Unauthorized",
    headers: {},
  });
};
const refreshableAdapter = () =>
  vi.fn<AxiosAdapter>(async (config) => {
    if (config.headers.Authorization === "Bearer access-old") return reject(config);
    return { config, data: "authorized", status: 200, statusText: "OK", headers: {} };
  });
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => (resolve = done));
  return { promise, resolve };
};

test("refreshes an expired token and retries once with the new bearer token", async () => {
  vi.mocked(refreshAuthSession).mockResolvedValue(tokens("new"));
  const adapter = refreshableAdapter();
  expect((await api.get("api/v1/userProfiles", { adapter })).data).toBe("authorized");
  expect(adapter).toHaveBeenCalledTimes(2);
  expect(refreshAuthSession).toHaveBeenCalledExactlyOnceWith("refresh-old");
  expect(readTokens()).toEqual(tokens("new"));
  expect(onUnauthorized).not.toHaveBeenCalled();
});

test("concurrent unauthorized responses share one refresh request", async () => {
  const refresh = deferred<AuthResponse>();
  vi.mocked(refreshAuthSession).mockReturnValue(refresh.promise);
  const adapter = refreshableAdapter();
  const results = Promise.allSettled([
    api.get("api/v1/userProfiles", { adapter }),
    api.get("api/v1/account/manage/info", { adapter }),
  ]);
  await vi.waitFor(() => expect(adapter).toHaveBeenCalledTimes(2));
  expect(refreshAuthSession).toHaveBeenCalledTimes(1);
  refresh.resolve(tokens("new"));
  expect((await results).every((result) => result.status === "fulfilled")).toBe(true);
  expect(refreshAuthSession).toHaveBeenCalledTimes(1);
  expect(onUnauthorized).not.toHaveBeenCalled();
});

test.each(["sign-out", "new-session"])("a late refresh cannot overwrite %s", async (change) => {
  const refresh = deferred<AuthResponse>();
  vi.mocked(refreshAuthSession).mockReturnValue(refresh.promise);
  const adapter = vi.fn(reject);
  const result = api.get("api/v1/userProfiles", { adapter }).catch((error: unknown) => error);
  await vi.waitFor(() => expect(refreshAuthSession).toHaveBeenCalledTimes(1));
  if (change === "sign-out") deleteTokens();
  else writeTokens(tokens("other-user"));
  refresh.resolve(tokens("stale"));
  expect(await result).toBeInstanceOf(AxiosError);
  expect(readTokens()).toEqual(change === "sign-out" ? null : tokens("other-user"));
  expect(adapter).toHaveBeenCalledTimes(1);
  expect(onUnauthorized).not.toHaveBeenCalled();
});

test("a rejected refreshed token ends the retry and signs out", async () => {
  vi.mocked(refreshAuthSession).mockResolvedValue(tokens("new"));
  const adapter = vi.fn(reject);
  await expect(api.get("api/v1/userProfiles", { adapter })).rejects.toBeInstanceOf(AxiosError);
  expect(adapter).toHaveBeenCalledTimes(2);
  expect(refreshAuthSession).toHaveBeenCalledTimes(1);
  expect(onUnauthorized).toHaveBeenCalledTimes(1);
});

test("failed refresh signs out without replaying the request", async () => {
  vi.mocked(refreshAuthSession).mockResolvedValue(null);
  const adapter = vi.fn(reject);
  await expect(api.get("api/v1/userProfiles", { adapter })).rejects.toBeInstanceOf(AxiosError);
  expect(adapter).toHaveBeenCalledTimes(1);
  expect(onUnauthorized).toHaveBeenCalledTimes(1);
});

test.each([ApiPaths.account.login, ApiPaths.account.refresh, ApiPaths.account.resetPassword])(
  "anonymous endpoint %s neither receives credentials nor refreshes on 401",
  async (url) => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      expect(config.headers.Authorization).toBeUndefined();
      expect(config.headers["X-Click2Approve-Work-Employee"]).toBeUndefined();
      return reject(config);
    });
    await expect(api.post(url, {}, { adapter, useWorkEmployeeContext: true })).rejects.toBeInstanceOf(AxiosError);
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(refreshAuthSession).not.toHaveBeenCalled();
    expect(onUnauthorized).not.toHaveBeenCalled();
  },
);

test("invalid delegated context retries once after clearing the represented employee", async () => {
  onWorkEmployeeInvalid.mockImplementation(async () => {
    employee = null;
  });
  const headers: unknown[] = [];
  const adapter: AxiosAdapter = async (config) => {
    headers.push(config.headers["X-Click2Approve-Work-Employee"]);
    throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, {
      config,
      data: {},
      status: 409,
      statusText: "Conflict",
      headers: new AxiosHeaders({ "X-Click2Approve-Work-Employee-Invalid": "true" }),
    });
  };
  await expect(
    api.get("api/v1/tenants/tenant-a/tasks", { adapter, useWorkEmployeeContext: true }),
  ).rejects.toBeInstanceOf(AxiosError);
  expect(headers).toEqual(["employee-a", undefined]);
  expect(onWorkEmployeeInvalid).toHaveBeenCalledTimes(1);
  expect(refreshAuthSession).not.toHaveBeenCalled();
});

test("revoked tenant membership does not replay the request", async () => {
  const adapter = vi.fn<AxiosAdapter>(async (config) => {
    throw new AxiosError("Conflict", "ERR_BAD_REQUEST", config, undefined, {
      config,
      data: {},
      status: 409,
      statusText: "Conflict",
      headers: { "x-click2approve-tenant-access-revoked": "true" },
    });
  });
  await expect(api.get("api/v1/tenants/tenant-a/tasks", { adapter })).rejects.toBeInstanceOf(AxiosError);
  expect(adapter).toHaveBeenCalledTimes(1);
  expect(onTenantAccessRevoked).toHaveBeenCalledTimes(1);
  expect(refreshAuthSession).not.toHaveBeenCalled();
});
