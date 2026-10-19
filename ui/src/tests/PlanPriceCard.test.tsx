import type { SubscriptionPlanConfiguration } from "@/features/subscriptions/api/subscriptionsApi";
import PlanPriceCard from "@/features/subscriptions/components/PlanPriceCard";
import { SubscriptionPlan } from "@/features/tenants/models/tenant";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

const plan: SubscriptionPlanConfiguration = {
  plan: SubscriptionPlan.BusinessPro,
  monthlyPriceUsd: 100,
  tokensPerMonth: 300000,
  configurableRetention: true,
  storageGigabytes: 100,
  tokenPrices: {
    FileUpload: 1,
    FileDownload: 2,
    WorkflowEmail: 5,
    RequestSubmission: 10,
    RequestResubmission: 10,
    TaskCreation: 2,
    TaskCompletion: 1,
  },
};

afterEach(cleanup);

describe("plan token explanation", () => {
  it("shows the published price, capacity, expiry, and a priced workload example", () => {
    render(<PlanPriceCard title="Business Pro" limits={plan} actions={null} />);
    expect(screen.getByText("$100 USD / month")).toBeTruthy();
    expect(screen.getByText("Excluding taxes")).toBeTruthy();
    expect(screen.getByText("300,000 tokens included")).toBeTruthy();
    expect(screen.getByText("100 GB storage")).toBeTruthy();
    expect(screen.getByText("Configurable retention")).toBeTruthy();
    expect(screen.getByText(/Unused tokens expire/)).toBeTruthy();
    expect(screen.getByText(/use 80 tokens/)).toBeTruthy();
    expect(screen.queryByText("Unlimited requests")).toBeNull();
  });

  it("calculates examples from server rates and explains the trial is one month only", () => {
    render(
      <PlanPriceCard
        title="Business Trial"
        limits={{
          ...plan,
          plan: SubscriptionPlan.BusinessTrial,
          configurableRetention: false,
          tokenPrices: { ...plan.tokenPrices, FileUpload: 2 },
        }}
        actions={null}
      />,
    );
    expect(screen.getByText("1 month retention")).toBeTruthy();
    expect(screen.getByText(/One month only. Tokens are granted once/)).toBeTruthy();
    expect(screen.getByText(/use 90 tokens/)).toBeTruthy();
  });
});
