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
    TaskCreation: 2,
  },
};

afterEach(cleanup);

describe("plan pricing summary", () => {
  it("shows the paid price and capacity without detailed token explanations", () => {
    render(<PlanPriceCard title="Business Pro" limits={plan} actions={null} />);
    expect(screen.getByText("$100 USD / month")).toBeTruthy();
    expect(screen.getByText("Excluding taxes")).toBeTruthy();
    expect(screen.getByText("300,000 tokens included")).toBeTruthy();
    expect(screen.getByText("100 GB storage")).toBeTruthy();
    expect(screen.getByText("Configurable retention")).toBeTruthy();
    expect(screen.queryByText(/Tokens renew/)).toBeNull();
    expect(screen.queryByText(/Unused tokens expire/)).toBeNull();
    expect(screen.queryByText(/Example:/)).toBeNull();
    expect(screen.queryByText(/Submit or resubmit request:/)).toBeNull();
    expect(screen.queryByText(/Complete task:/)).toBeNull();
    expect(screen.queryByText(/Cancel request:/)).toBeNull();
    expect(screen.queryByText("Unlimited requests")).toBeNull();
  });

  it("shows the trial duration without a monthly price or tax disclaimer", () => {
    render(
      <PlanPriceCard
        title="Business Trial"
        limits={{
          ...plan,
          plan: SubscriptionPlan.BusinessTrial,
          monthlyPriceUsd: 0,
          configurableRetention: false,
        }}
        actions={null}
      />,
    );
    expect(screen.getByText("1 month retention")).toBeTruthy();
    expect(screen.getByText("Free for 1 month")).toBeTruthy();
    expect(screen.queryByText(/USD \/ month/)).toBeNull();
    expect(screen.queryByText("Excluding taxes")).toBeNull();
  });

  it("shows Personal Free without a monthly price or tax disclaimer", () => {
    render(
      <PlanPriceCard
        title="Personal Free"
        limits={{ ...plan, plan: SubscriptionPlan.PersonalFree, monthlyPriceUsd: 0 }}
        actions={null}
      />,
    );
    expect(screen.getByText("Free")).toBeTruthy();
    expect(screen.queryByText(/USD \/ month/)).toBeNull();
    expect(screen.queryByText("Excluding taxes")).toBeNull();
  });
});
