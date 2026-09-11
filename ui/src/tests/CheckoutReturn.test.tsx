import { stores } from "@/app/rootStore";
import SubscriptionPlansPage from "@/features/subscriptions/pages/SubscriptionPlansPage";
import { SubscriptionPlan } from "@/features/tenants/models/tenant";
import TenantScopeLayout from "@/layouts/TenantScopeLayout";
import MainMenuDrawer from "@/shared/components/layout/MainMenuDrawer";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { runInAction } from "mobx";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  count: vi.fn(),
  switchTenant: vi.fn(),
  clear: vi.fn(),
}));
vi.mock("@/app/rootStore", async () => {
  const { observable, action } = await import("mobx");
  const tenantStore = observable({
    hasLoaded: true,
    currentTenantGlobalId: "paid",
    tenants: [
      {
        globalId: "paid",
        businessName: "Acme",
        type: 1,
        subscriptionPlan: 3,
        currentEmployeeGlobalId: "owner",
      },
    ],
    get currentTenant() {
      return this.tenants.find((tenant) => tenant.globalId === this.currentTenantGlobalId);
    },
    load: vi.fn().mockResolvedValue(undefined),
    setCurrentScope: action((id: string) => {
      tenantStore.currentTenantGlobalId = id;
    }),
  });
  return {
    stores: {
      tenantStore,
      userAccountStore: { currentUser: {} },
      applicationConfigurationStore: {
        tenantsAreEnabled: true,
        subscriptionsAreEnabled: true,
      },
      billingAccessStore: { isBlocked: () => false },
      commonStore: {
        updateActionLoadingCounter: vi.fn(),
        setMainMenuDrawerIsOpen: vi.fn(),
        mainMenuDrawerIsOpen: false,
      },
      approvalRequestTaskStore: {
        numberOfUncompletedTasks: 0,
        loadUncompletedCount: mocks.count,
      },
      switchTenant: mocks.switchTenant,
      clearTenantScope: mocks.clear,
    },
  };
});
vi.mock("@/features/subscriptions/api/subscriptionsApi", () => ({
  getSubscriptionPlans: vi.fn().mockResolvedValue([]),
  refreshBilling: mocks.refresh,
  changeSubscriptionPlan: vi.fn(),
  recoverPayment: vi.fn(),
  cancelScheduledPlanChange: vi.fn(),
}));
vi.mock("@/shared/utils/persistenceNotifications", () => ({
  PersistenceSuccessMessages: {},
  showPersistenceSuccessNotification: vi.fn(),
}));
afterEach(cleanup);
beforeEach(() => vi.clearAllMocks());

describe("return from Stripe", () => {
  it.each([
    { currentTenantGlobalId: "paid", paymentResolutionRequired: false },
    { currentTenantGlobalId: "previous", paymentResolutionRequired: false },
    { currentTenantGlobalId: "paid", paymentResolutionRequired: true },
  ])(
    "verifies the return and stays on Plans: $currentTenantGlobalId, unpaid=$paymentResolutionRequired",
    async ({ currentTenantGlobalId, paymentResolutionRequired }) => {
      runInAction(() => {
        stores.tenantStore.currentTenantGlobalId = currentTenantGlobalId;
      });
      let complete!: (value: unknown) => void;
      mocks.refresh.mockReturnValue(
        new Promise((resolve) => {
          complete = resolve;
        }),
      );
      render(
        <MemoryRouter initialEntries={["/tenants/paid/plans"]}>
          <MainMenuDrawer />
          <Link to="/tenants/paid/requests">Open workspace</Link>
          <Routes>
            <Route path="/tenants" element={<div>Organizations list</div>} />
            <Route path="/tenants/:tenantGlobalId" element={<TenantScopeLayout />}>
              <Route path="plans" element={<SubscriptionPlansPage />} />
              <Route path="requests" element={<div>Workspace requests</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      );
      await waitFor(() => expect(mocks.refresh).toHaveBeenCalledWith("paid"));
      expect(mocks.switchTenant).not.toHaveBeenCalled();
      expect(mocks.count).not.toHaveBeenCalled();
      expect(screen.queryByText("Organizations list")).toBeNull();
      await act(async () => {
        complete({
          canManage: true,
          hasSubscription: true,
          paymentResolutionRequired,
          cleanupStarted: false,
          suspendedAt: null,
          recoveryDeadline: null,
          pendingPlan: null,
          scheduledPlan: null,
          scheduledPlanEffectiveAt: null,
          checkoutUrl: null,
        });
      });
      if (paymentResolutionRequired) {
        expect(await screen.findByText("Complete payment to activate your selected plan.")).toBeTruthy();
        expect(screen.queryByText("Organizations list")).toBeNull();
        return;
      }
      expect(await screen.findByText("Active")).toBeTruthy();
      expect(stores.tenantStore.currentTenant?.subscriptionPlan).toBe(SubscriptionPlan.BusinessStarter);
      expect(mocks.count).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("link", { name: "Open workspace" }));
      await screen.findByText("Workspace requests");
      expect(mocks.count).toHaveBeenCalledWith("paid");
    },
  );
});
