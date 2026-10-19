import SubscriptionUsagePage from "@/features/subscriptions/pages/SubscriptionUsagePage";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/rootStore", () => ({
  stores: { commonStore: { updateActionLoadingCounter: vi.fn() } },
}));
vi.mock("@mui/x-charts/BarChart", () => ({ BarChart: () => null }));
vi.mock("@/features/subscriptions/api/subscriptionsApi", () => ({
  getSubscriptionUsage: vi.fn().mockResolvedValue({
    tokenAllowance: 50000,
    tokenBalance: 45000,
    storageBytes: 1000000000,
    limits: { storageGigabytes: 10 },
    usagePeriodStartsAt: "2026-10-01T00:00:00Z",
    usagePeriodEndsAt: "2026-11-01T00:00:00Z",
    actions: [{ action: "WorkflowEmail", quantity: 800, tokens: 4000 }],
  }),
}));

afterEach(cleanup);

describe("workspace token usage", () => {
  it("shows available tokens, storage, renewal period, and spending", async () => {
    render(
      <MemoryRouter initialEntries={["/tenants/test/usage"]}>
        <Routes>
          <Route path="/tenants/:tenantGlobalId/usage" element={<SubscriptionUsagePage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/45,000 tokens available/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Tokens" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Storage" })).toBeTruthy();
    expect(screen.getByText("1 GB of 10 GB")).toBeTruthy();
    expect(screen.getByText(/Workflow Email: 4,000 tokens/)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Requests" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Tasks" })).toBeNull();
  });
});
