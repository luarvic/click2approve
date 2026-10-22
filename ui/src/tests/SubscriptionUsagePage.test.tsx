import { getSubscriptionUsage } from "@/features/subscriptions/api/subscriptionsApi";
import SubscriptionUsagePage from "@/features/subscriptions/pages/SubscriptionUsagePage";
import { cleanup, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/rootStore", () => ({
  stores: { commonStore: { updateActionLoadingCounter: vi.fn() } },
}));
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
    expect(await screen.findByText("45,000")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Tokens usage" }).getAttribute("aria-valuetext")).toBe(
      "5,000 used, 45,000 available",
    );
    expect(screen.queryByText(/Unused tokens expire/)).toBeNull();
    expect(screen.queryByText(/Uploads, file viewing/)).toBeNull();
    expect(screen.getByRole("heading", { name: "Tokens" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Storage" })).toBeTruthy();
    expect(screen.getByText("1 GB of 10 GB")).toBeTruthy();
    const table = screen.getByRole("table", { name: "Token usage details" });
    expect(within(table).getByRole("columnheader", { name: "Action" })).toBeTruthy();
    expect(within(table).getByRole("columnheader", { name: "Tokens used" })).toBeTruthy();
    expect(within(table).getByRole("row", { name: "Workflow Email 4,000" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Expand Token usage details/ })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Requests" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Tasks" })).toBeNull();
  });

  it("floors token counts while retaining fractional quota precision", async () => {
    const usage = await getSubscriptionUsage("test");
    vi.mocked(getSubscriptionUsage).mockResolvedValueOnce({
      ...usage,
      tokenBalance: 44999.75,
      actions: [{ action: "Upload", quantity: 0.25, tokens: 0.25 }],
    });
    render(
      <MemoryRouter initialEntries={["/tenants/test/usage"]}>
        <Routes>
          <Route path="/tenants/:tenantGlobalId/usage" element={<SubscriptionUsagePage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("5,000 of 50,000")).toBeTruthy();
    expect(screen.getByText("44,999")).toBeTruthy();
    expect(screen.getByRole("row", { name: "Upload 0" })).toBeTruthy();
    const progress = screen.getByRole("progressbar", { name: "Tokens usage" });
    expect(progress.getAttribute("aria-valuetext")).toBe("5,000 used, 44,999 available");
    expect(Number(progress.getAttribute("aria-valuenow"))).toBeCloseTo(10.0005);
  });

  it("sorts by precise token usage descending, then alphabetically for ties", async () => {
    const usage = await getSubscriptionUsage("test");
    const actions = [
      { action: "TaskCreation", quantity: 1, tokens: 6.1 },
      { action: "WorkflowEmail", quantity: 1, tokens: 55 },
      { action: "FileDownload", quantity: 1, tokens: 0 },
      { action: "FileUpload", quantity: 1, tokens: 6.9 },
      { action: "RequestSubmission", quantity: 1, tokens: 55 },
    ];
    vi.mocked(getSubscriptionUsage).mockResolvedValueOnce({ ...usage, actions });
    render(
      <MemoryRouter initialEntries={["/tenants/test/usage"]}>
        <Routes>
          <Route path="/tenants/:tenantGlobalId/usage" element={<SubscriptionUsagePage />} />
        </Routes>
      </MemoryRouter>,
    );
    const table = await screen.findByRole("table", { name: "Token usage details" });
    expect(
      within(table)
        .getAllByRole("rowheader")
        .map((cell) => cell.textContent),
    ).toEqual(["Request Submission", "Workflow Email", "File Upload", "Task Creation", "File Download"]);
    expect(within(table).getByRole("columnheader", { name: "Tokens used" }).getAttribute("aria-sort")).toBe(
      "descending",
    );
    expect(actions[0].action).toBe("TaskCreation");
  });
});
