import { stores } from "@/app/rootStore";
import ApprovalRequestSubmitPage from "@/features/approvalRequests/pages/ApprovalRequestSubmitPage";
import PublicReceiptPage from "@/features/receipts/pages/PublicReceiptPage";
import SubscriptionRetentionPage from "@/features/subscriptions/pages/SubscriptionRetentionPage";
import TenantEditorPage from "@/features/tenants/pages/TenantEditorPage";
import { GlobalLoadingActionLoaderScopes } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revision: vi.fn(),
  setRevision: vi.fn(),
  tenant: vi.fn(),
  retention: vi.fn(),
  receipt: vi.fn(),
}));

vi.mock("@/app/rootStore", async () => {
  const { CommonStore } = await import("@/shared/stores/commonStore");
  return {
    stores: {
      commonStore: new CommonStore(),
      tenantStore: {
        hasLoaded: true,
        currentTenantGlobalId: "tenant-a",
        currentTenant: { type: "Personal" },
        currentWorkEmployeeGlobalId: null,
      },
      applicationConfigurationStore: {},
      approvalRequestStore: { loadDetails: mocks.revision, setRequestToClone: mocks.setRevision },
    },
  };
});
vi.mock("@/features/approvalRequests/components/ApprovalRequestSubmit", () => ({
  default: () => <div>Request editor</div>,
}));
vi.mock("@/features/tenants/components/TenantDialog", () => ({
  default: () => <div>Organization editor</div>,
}));
vi.mock("@/features/tenants/api/tenantsApi", () => ({ getTenant: mocks.tenant }));
vi.mock("@/features/subscriptions/api/subscriptionsApi", () => ({
  getRetentionPolicy: mocks.retention,
  saveRetentionPolicy: vi.fn(),
}));
vi.mock("@/features/receipts/api/receiptLinksApi", () => ({ getReceiptByLink: mocks.receipt }));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const showPage = (path: string) => {
  const router = createMemoryRouter(
    [
      { path: "/requests/new", element: <ApprovalRequestSubmitPage /> },
      { path: "/requests/:approvalRequestGlobalId/resubmit", element: <ApprovalRequestSubmitPage /> },
      { path: "/organizations/:tenantGlobalId", element: <TenantEditorPage /> },
      { path: "/tenants/:tenantGlobalId/retention", element: <SubscriptionRetentionPage /> },
      { path: "/receipt-verification/:linkGlobalId", element: <PublicReceiptPage /> },
      { path: "/away", element: <div>Another page</div> },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
beforeEach(() => {
  vi.clearAllMocks();
});

describe("revision resource states", () => {
  it("keeps the editor hidden while loading and shows not found for an unavailable revision source", async () => {
    const request = deferred<null>();
    mocks.revision.mockReturnValue(request.promise);
    showPage("/requests/missing/resubmit");
    expect(screen.queryByText("Request editor")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Page not found" })).toBeNull();
    expect(stores.commonStore.isAnyActionLoading(GlobalLoadingActionLoaderScopes)).toBe(true);

    await act(async () => request.resolve(null));
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeTruthy();
    expect(screen.queryByText("Request editor")).toBeNull();
    expect(stores.commonStore.isAnyActionLoading(GlobalLoadingActionLoaderScopes)).toBe(false);
  });

  it("opens a valid revision using the loaded request", async () => {
    const request = { globalId: "request-a", title: "Budget" };
    mocks.revision.mockResolvedValue(request);
    showPage("/requests/request-a/resubmit");
    await screen.findByText("Request editor");
    expect(mocks.setRevision).toHaveBeenCalledWith(request);
    expect(screen.queryByRole("heading", { name: "Page not found" })).toBeNull();
  });

  it("does not restore an earlier revision when its response arrives after navigation", async () => {
    const first = deferred<{ globalId: string }>();
    mocks.revision.mockReturnValueOnce(first.promise).mockResolvedValueOnce(null);
    const router = showPage("/requests/first/resubmit");
    await act(async () => router.navigate("/requests/missing/resubmit"));
    await screen.findByRole("heading", { name: "Page not found" });
    await act(async () => first.resolve({ globalId: "first" }));
    expect(screen.queryByText("Request editor")).toBeNull();
    expect(mocks.setRevision).not.toHaveBeenCalledWith({ globalId: "first" });
    expect(stores.commonStore.isAnyActionLoading(GlobalLoadingActionLoaderScopes)).toBe(false);
  });

  it("still opens ordinary new-request composition without a revision lookup", () => {
    showPage("/requests/new");
    expect(screen.getByText("Request editor")).toBeTruthy();
    expect(mocks.revision).not.toHaveBeenCalled();
  });
});

describe("visible page loading", () => {
  it("keeps organization details hidden during the shared loading state and releases progress when unavailable", async () => {
    const request = deferred<null>();
    mocks.tenant.mockReturnValue(request.promise);
    showPage("/organizations/missing");
    expect(screen.queryByText("Organization editor")).toBeNull();
    expect(stores.commonStore.isAnyActionLoading(GlobalLoadingActionLoaderScopes)).toBe(true);
    await act(async () => request.resolve(null));
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeTruthy();
    expect(stores.commonStore.isAnyActionLoading(GlobalLoadingActionLoaderScopes)).toBe(false);
  });

  it("clears retention progress and presents an error instead of an indefinite blank page", async () => {
    const request = deferred<never>();
    const errorNotification = vi.spyOn(notification, "error").mockImplementation(() => undefined);
    mocks.retention.mockReturnValue(request.promise);
    showPage("/tenants/tenant-a/retention");
    expect(stores.commonStore.isAnyActionLoading(GlobalLoadingActionLoaderScopes)).toBe(true);
    await act(async () => request.reject(new Error("Unavailable")));
    expect(screen.getByRole("alert").textContent).toContain("Unable to load retention settings");
    expect(errorNotification).toHaveBeenCalledOnce();
    expect(stores.commonStore.isAnyActionLoading(GlobalLoadingActionLoaderScopes)).toBe(false);
  });

  it("keeps a standalone main landmark and local progress while a public receipt loads", async () => {
    const request = deferred<null>();
    mocks.receipt.mockReturnValue(request.promise);
    showPage("/receipt-verification/missing");
    expect(screen.getByRole("main").getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("progressbar")).toBeTruthy();
    await act(async () => request.resolve(null));
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeTruthy();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("does not set stale organization data after switching organizations", async () => {
    const first = deferred<{ globalId: string }>();
    mocks.tenant.mockReturnValueOnce(first.promise).mockResolvedValueOnce(null);
    const router = showPage("/organizations/first");
    await act(async () => router.navigate("/organizations/missing"));
    await screen.findByRole("heading", { name: "Page not found" });
    await act(async () => first.resolve({ globalId: "first" }));
    expect(screen.queryByText("Organization editor")).toBeNull();
    await waitFor(() => expect(stores.commonStore.isAnyActionLoading(GlobalLoadingActionLoaderScopes)).toBe(false));
  });
});
