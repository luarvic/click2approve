import KnownBillingAccess from "@/features/subscriptions/components/KnownBillingAccess";
import { BillingAccessStore } from "@/features/subscriptions/stores/billingAccessStore";
import api from "@/shared/api/axios";
import { configureRequestContext } from "@/shared/api/requestContext";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AxiosResponse } from "axios";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/identity/api/authApi", () => ({ refreshAuthSession: vi.fn() }));
vi.mock("@/shared/session/session", () => ({ readTokens: () => null }));
vi.mock("@/app/rootStore", () => ({
  stores: {
    get billingAccessStore() {
      return access;
    },
  },
}));

let access: BillingAccessStore;
const clearTenantScope = vi.fn();
const suspended = { code: "tenant_suspended", tenantGlobalId: "tenant-a" };

beforeEach(() => {
  vi.clearAllMocks();
  access = new BillingAccessStore();
  configureRequestContext({
    getWorkEmployeeGlobalId: () => null,
    onWorkEmployeeInvalid: async () => undefined,
    onUnauthorized: vi.fn(),
    onTenantSuspended: (tenantGlobalId) => {
      access.block(tenantGlobalId);
      if (tenantGlobalId === "tenant-a") clearTenantScope();
    },
  });
});
afterEach(cleanup);

const pendingRequest = (url = "api/v1/tenants/tenant-a/requests", method = "get") => {
  let succeed!: (data: unknown) => void;
  let fail!: (status?: number, data?: unknown) => void;
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const request = api.request({
    url,
    method,
    adapter: (config) =>
      new Promise<AxiosResponse>((resolve, reject) => {
        succeed = (data) => resolve({ config, data, status: 200, statusText: "OK", headers: {} });
        fail = (status = 402, data = suspended) => reject({ config, response: { status, data }, isAxiosError: true });
        started();
      }),
  });
  return {
    request,
    ready,
    succeed: (data: unknown) => succeed(data),
    fail: (status?: number, data?: unknown) => fail(status, data),
  };
};
const block = () => access.block("tenant-a");

describe("remembered billing access", () => {
  it("uses the suspension response tenant ID and clears the current tenant content", async () => {
    const request = pendingRequest("api/v1/unrelated-endpoint");
    await request.ready;
    request.fail();
    await expect(request.request).rejects.toBeDefined();
    expect(access.isBlocked("tenant-a")).toBe(true);
    expect(clearTenantScope).toHaveBeenCalledTimes(1);
  });
  it.each([
    [400, suspended],
    [402, { code: "other_error", tenantGlobalId: "tenant-a" }],
    [402, { code: "tenant_suspended" }],
  ])("ignores responses that are not tenant suspensions", async (status, data) => {
    const request = pendingRequest();
    await request.ready;
    request.fail(status as number, data);
    await expect(request.request).rejects.toBeDefined();
    expect(access.isBlocked("tenant-a")).toBe(false);
  });
  it("redirects a known-blocked tenant before mounting Requests and permits navigation after recovery", async () => {
    block();
    const mounted = vi.fn();
    const Requests = () => {
      mounted();
      return <div>Requests content</div>;
    };
    render(
      <MemoryRouter basename="/app" initialEntries={["/app/tenants/tenant-a/requests"]}>
        <Routes>
          <Route
            path="/tenants/:tenantGlobalId/requests"
            element={
              <KnownBillingAccess>
                <Requests />
              </KnownBillingAccess>
            }
          />
          <Route
            path="/tenants/:tenantGlobalId/plans"
            element={
              <KnownBillingAccess>
                <Link to="../requests" relative="path">
                  Plans recovery
                </Link>
              </KnownBillingAccess>
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("Plans recovery")).toBeTruthy();
    expect(mounted).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Plans recovery"));
    expect(mounted).not.toHaveBeenCalled();
    await act(async () => {
      access.unblock("tenant-a");
    });
    fireEvent.click(screen.getByText("Plans recovery"));
    expect(await screen.findByText("Requests content")).toBeTruthy();
  });
});
