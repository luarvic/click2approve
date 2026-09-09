import {
  cancelScheduledPlanChange,
  changeSubscriptionPlan,
  recoverPayment,
  refreshBilling,
} from "@/features/subscriptions/api/subscriptionsApi";
import { SubscriptionPlan } from "@/features/tenants/models/tenant";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn(), error: vi.fn(), unblock: vi.fn() }));
vi.mock("@/app/rootStore", () => ({ stores: { billingAccessStore: { unblock: mocks.unblock } } }));
vi.mock("@/shared/api/axios", () => ({ default: { post: mocks.post, put: mocks.put } }));
vi.mock("@/shared/utils/notifications", () => ({ notification: { error: mocks.error } }));
beforeEach(() => vi.clearAllMocks());
describe("subscription API error notifications", () => {
  it("shows the trial-reuse error and retains the rejection so callers cannot report success", async () => {
    const message = "You have already used a Business Trial organization.";
    const error = {
      isAxiosError: true,
      response: { status: 400, data: { title: message, status: 400, traceId: "trial-test" } },
    };
    mocks.put.mockRejectedValue(error);
    await expect(changeSubscriptionPlan("tenant", SubscriptionPlan.BusinessTrial)).rejects.toBe(error);
    expect(mocks.error).toHaveBeenCalledTimes(1);
    expect(mocks.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message,
        details: expect.arrayContaining([{ label: "Trace ID", value: "trial-test" }]),
      }),
    );
  });
  it.each([recoverPayment, refreshBilling, cancelScheduledPlanChange])(
    "shows billing-action failures",
    async (action) => {
      const error = new Error("Stripe is unavailable.");
      mocks.post.mockRejectedValue(error);
      await expect(action("tenant")).rejects.toBe(error);
      expect(mocks.error).toHaveBeenCalledWith(expect.objectContaining({ message: error.message }));
      expect(mocks.error).toHaveBeenCalledTimes(1);
    },
  );
  it("does not show an error after a successful plan change", async () => {
    const status = { scheduledPlan: SubscriptionPlan.PersonalFree };
    mocks.put.mockResolvedValue({ data: status });
    expect(await changeSubscriptionPlan("tenant", SubscriptionPlan.PersonalFree)).toBe(status);
    expect(mocks.error).not.toHaveBeenCalled();
  });
  it("restores route access only after billing refresh reports an active tenant", async () => {
    const activeBilling = { paymentRequired: false, cleanupStarted: false, suspendedAt: null };
    mocks.post.mockResolvedValue({ data: activeBilling });
    expect(await refreshBilling("tenant")).toBe(activeBilling);
    expect(mocks.unblock).toHaveBeenCalledWith("tenant");
  });
});
