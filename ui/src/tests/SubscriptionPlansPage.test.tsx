import { PaymentIssue } from "@/features/subscriptions/models/paymentIssue";
import SubscriptionPlansPage from "@/features/subscriptions/pages/SubscriptionPlansPage";
import { SubscriptionPlan, TenantType } from "@/features/tenants/models/tenant";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { StrictMode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  status: vi.fn(),
  cancel: vi.fn(),
  refresh: vi.fn(),
  change: vi.fn(),
  recover: vi.fn(),
  load: vi.fn(),
  tenant: { globalId: "test", type: 0, subscriptionPlan: 0, businessName: "Workspace" },
}));
vi.mock("@/app/rootStore", () => ({
  stores: {
    tenantStore: {
      get currentTenant() {
        return mocks.tenant;
      },
      tenants: [],
      hasLoaded: true,
      load: mocks.load,
    },
    commonStore: { updateActionLoadingCounter: vi.fn() },
  },
}));
vi.mock("@/features/subscriptions/api/subscriptionsApi", () => ({
  getBillingStatus: mocks.status,
  cancelScheduledPlanChange: mocks.cancel,
  refreshBilling: mocks.refresh,
  changeSubscriptionPlan: mocks.change,
  recoverPayment: mocks.recover,
  getSubscriptionPlans: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/shared/utils/persistenceNotifications", () => ({
  PersistenceSuccessMessages: {},
  showPersistenceSuccessNotification: vi.fn(),
}));
const active = {
  paymentIssue: null,
  canManage: true,
  hasSubscription: false,
  paymentRequired: false,
  cleanupStarted: false,
  suspendedAt: null,
  recoveryDeadline: null,
  pendingPlan: null,
  scheduledPlan: null,
  scheduledPlanEffectiveAt: null,
  checkoutUrl: null,
};
const showPage = (path = "/tenants/test/plans") =>
  render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/tenants/:tenantGlobalId/plans" element={<SubscriptionPlansPage />} />
        </Routes>
      </MemoryRouter>
    </StrictMode>,
  );
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.tenant.type = TenantType.Personal;
  mocks.tenant.subscriptionPlan = SubscriptionPlan.PersonalFree;
  mocks.load.mockResolvedValue(undefined);
  mocks.refresh.mockResolvedValue(active);
  mocks.status.mockResolvedValue(active);
});
describe("plans and billing", () => {
  it.each(["", "?retryPendingPlan=True", "?retryPendingPlan=true"])(
    "waits for backend recovery and renders the verified plan for return URL %s",
    async (search) => {
      mocks.refresh.mockImplementation(async () => {
        mocks.tenant.subscriptionPlan = SubscriptionPlan.PersonalPro;
        return { ...active, hasSubscription: true };
      });
      showPage(`/tenants/test/plans${search}`);
      expect(await screen.findByRole("button", { name: "Manage billing" })).toBeTruthy();
      expect(mocks.refresh).toHaveBeenCalledTimes(1);
      expect(mocks.load).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("heading", { name: "Personal Pro" }).closest(".MuiCard-root")?.textContent).toContain(
        "Active",
      );
    },
  );
  it("keeps an unpaid upgrade actionable when the backend still requires payment", async () => {
    mocks.refresh.mockResolvedValue({ ...active, pendingPlan: SubscriptionPlan.PersonalPro });
    showPage();
    expect(await screen.findByRole("button", { name: "Resolve payment" })).toBeTruthy();
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("heading", { name: "Personal Free" }).closest(".MuiCard-root")?.textContent).toContain(
      "Active",
    );
  });
  it("shows recovery failure without substituting stale billing status", async () => {
    mocks.refresh.mockRejectedValue(new Error("Stripe unavailable"));
    showPage("/tenants/test/plans?retryPendingPlan=True");
    expect(await screen.findByText("Unable to load plans and payment status. Refresh to try again.")).toBeTruthy();
    expect(mocks.status).not.toHaveBeenCalled();
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });
  it.each([
    [PaymentIssue.PaymentMethodRequired, "Add a payment method to complete this payment."],
    [PaymentIssue.Declined, "Your payment was declined. Update your payment method."],
    [PaymentIssue.AuthenticationRequired, "Confirm your payment to complete it."],
    [PaymentIssue.Processing, "Your payment is processing."],
  ])("shows payment issue %s in a banner above the cards", async (paymentIssue, message) => {
    mocks.refresh.mockResolvedValue({ ...active, pendingPlan: SubscriptionPlan.PersonalPro, paymentIssue });
    showPage();
    const action = await screen.findByRole("button", { name: "Resolve payment" });
    const banner = screen.getByText(message as string).closest('[role="alert"]');
    expect(banner).toBeTruthy();
    expect(banner?.closest(".MuiCard-root")).toBeNull();
    expect(within(action.closest(".MuiCard-root") as HTMLElement).queryByText(message as string)).toBeNull();
    expect(screen.queryByText(/awaiting payment confirmation/)).toBeNull();
    cleanup();
    mocks.refresh.mockResolvedValue({ ...active, hasSubscription: true });
    mocks.tenant.subscriptionPlan = SubscriptionPlan.PersonalPro;
    showPage();
    await screen.findByRole("button", { name: "Manage billing" });
    expect(screen.queryByText(message as string)).toBeNull();
  });
  it("uses server permissions to prevent plan changes even for a personal tenant", async () => {
    mocks.refresh.mockResolvedValue({ ...active, canManage: false, hasSubscription: true });
    showPage();
    const card = await screen.findByRole("button", { name: /Personal Pro/ });
    expect(card.hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Manage billing" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Manage billing" }));
    expect(mocks.recover).not.toHaveBeenCalled();
    fireEvent.click(card);
    expect(mocks.change).not.toHaveBeenCalled();
  });
  it("lets a manager change plans and keeps the existing plan current while payment is pending", async () => {
    mocks.change.mockResolvedValue({ ...active, pendingPlan: SubscriptionPlan.PersonalPro });
    showPage();
    fireEvent.click(await screen.findByRole("button", { name: /Personal Pro/ }));
    expect(await screen.findByText(/Your change to Personal Pro is pending/)).toBeTruthy();
    expect(mocks.change).toHaveBeenCalledWith("test", SubscriptionPlan.PersonalPro);
    expect(screen.getByRole("heading", { name: "Personal Free" }).closest(".MuiCard-root")?.textContent).toContain(
      "Active",
    );
    expect(screen.getByRole("button", { name: "Resolve payment" })).toBeTruthy();
  });
  it("keeps the trial active and puts payment recovery on the pending Starter card", async () => {
    mocks.tenant.type = TenantType.Business;
    mocks.tenant.subscriptionPlan = SubscriptionPlan.BusinessTrial;
    mocks.refresh.mockResolvedValue({ ...active, pendingPlan: SubscriptionPlan.BusinessStarter });
    showPage();
    expect(
      (await screen.findByRole("heading", { name: "Business Trial" })).closest(".MuiCard-root")?.textContent,
    ).toContain("Active");
    expect(screen.getByRole("heading", { name: "Business Starter" }).closest(".MuiCard-root")?.textContent).toContain(
      "Pending",
    );
    expect(screen.getAllByText("Pending")).toHaveLength(1);
    const recoveryCard = screen.getByRole("button", { name: "Resolve payment" }).closest(".MuiCard-root");
    expect(recoveryCard?.textContent).toContain("Business Starter");
    expect(recoveryCard?.textContent).not.toContain("Business Trial");
  });
  it("shows suspension and cleanup consequences, then refreshes verified payment state", async () => {
    mocks.tenant.subscriptionPlan = SubscriptionPlan.PersonalPro;
    mocks.refresh.mockResolvedValueOnce({
      ...active,
      hasSubscription: true,
      paymentRequired: true,
      suspendedAt: "2026-09-07T00:00:00Z",
      recoveryDeadline: "2026-09-14T00:00:00Z",
    });
    showPage();
    expect(await screen.findByText("Suspended")).toBeTruthy();
    expect(screen.getByText(/personal workflow data and uploads will be deleted/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Personal Free/ }).hasAttribute("disabled")).toBe(true);
    mocks.refresh.mockResolvedValue({ ...active, hasSubscription: true });
    expect(screen.queryByRole("button", { name: "Check payment status" })).toBeNull();
    cleanup();
    showPage();
    expect(await screen.findByText("Active")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Manage billing" })).toBeTruthy();
    await waitFor(() => expect(mocks.load).toHaveBeenCalledTimes(2));
  });
  it("routes a manager's billing action through the recovery API and handles rejection", async () => {
    mocks.refresh.mockResolvedValue({ ...active, hasSubscription: true });
    mocks.recover.mockRejectedValue(new Error("Portal unavailable"));
    showPage();
    fireEvent.click(await screen.findByRole("button", { name: "Manage billing" }));
    await waitFor(() => expect(mocks.recover).toHaveBeenCalledWith("test"));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Manage billing" }).hasAttribute("disabled")).toBe(false),
    );
  });
  it("cancels the scheduled downgrade and keeps the current plan", async () => {
    mocks.tenant.subscriptionPlan = SubscriptionPlan.PersonalPro;
    mocks.refresh.mockResolvedValue({ ...active, hasSubscription: true, scheduledPlan: SubscriptionPlan.PersonalFree });
    mocks.cancel.mockResolvedValue({ ...active, hasSubscription: true });
    showPage();
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByText("Planned")).toBeNull());
    expect(mocks.cancel).toHaveBeenCalledWith("test");
    expect(screen.getByRole("heading", { name: "Personal Pro" }).closest(".MuiCard-root")?.textContent).toContain(
      "Active",
    );
  });
  it("keeps the scheduled change visible if cancellation fails", async () => {
    mocks.refresh.mockResolvedValue({ ...active, hasSubscription: true, scheduledPlan: SubscriptionPlan.PersonalFree });
    mocks.cancel.mockRejectedValue(new Error("Stripe unavailable"));
    showPage();
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(mocks.cancel).toHaveBeenCalled());
    expect(screen.getByText("Planned")).toBeTruthy();
  });
  it("disables scheduled-change cancellation for ordinary members", async () => {
    mocks.refresh.mockResolvedValue({ ...active, canManage: false, scheduledPlan: SubscriptionPlan.PersonalFree });
    showPage();
    await screen.findByText("Planned");
    expect(screen.getByRole("button", { name: "Cancel" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mocks.cancel).not.toHaveBeenCalled();
  });
  it("shows the scheduled effective date and explicit Choose buttons only for other plans", async () => {
    mocks.tenant.type = TenantType.Business;
    mocks.tenant.subscriptionPlan = SubscriptionPlan.BusinessStandard;
    const effectiveAt = "2026-10-08T14:30:00Z";
    mocks.refresh.mockResolvedValue({
      ...active,
      hasSubscription: true,
      scheduledPlan: SubscriptionPlan.BusinessStarter,
      scheduledPlanEffectiveAt: effectiveAt,
    });
    showPage();
    expect(await screen.findByText(`Effective ${new Date(effectiveAt).toLocaleString()}`)).toBeTruthy();
    const scheduledCard = screen.getByRole("heading", { name: "Business Starter" }).closest(".MuiCard-root");
    expect(scheduledCard?.textContent).toContain("Planned");
    expect(screen.getAllByRole("button", { name: /^Choose / })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Choose Business Standard" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Choose Business Starter" })).toBeNull();
  });
  it("shows a spinner only on the selected Choose button while disabling the others", async () => {
    mocks.tenant.type = TenantType.Business;
    mocks.tenant.subscriptionPlan = SubscriptionPlan.BusinessTrial;
    let rejectChange!: (error: Error) => void;
    mocks.change.mockReturnValue(
      new Promise((_, reject) => {
        rejectChange = reject;
      }),
    );
    showPage();
    const selected = await screen.findByRole("button", { name: "Choose Business Starter" });
    const other = screen.getByRole("button", { name: "Choose Business Standard" });
    fireEvent.click(selected);
    expect(within(selected).getByRole("progressbar")).toBeTruthy();
    expect(other.hasAttribute("disabled")).toBe(true);
    expect(within(other).queryByRole("progressbar")).toBeNull();
    fireEvent.click(other);
    expect(mocks.change).toHaveBeenCalledTimes(1);
    rejectChange(new Error("Request failed"));
    await waitFor(() => expect(selected.hasAttribute("disabled")).toBe(false));
    expect(within(selected).queryByRole("progressbar")).toBeNull();
    expect(other.hasAttribute("disabled")).toBe(false);
  });
  it("shows disabled payment recovery for ordinary members", async () => {
    mocks.refresh.mockResolvedValue({ ...active, canManage: false, pendingPlan: SubscriptionPlan.PersonalPro });
    showPage();
    const button = await screen.findByRole("button", { name: "Resolve payment" });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.click(button);
    expect(mocks.recover).not.toHaveBeenCalled();
  });
  it("fails closed if billing verification fails", async () => {
    mocks.refresh.mockRejectedValue(new Error("offline"));
    showPage();
    expect(await screen.findByText(/Unable to load plans and payment status/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Personal Pro/ })).toBeNull();
  });
});
