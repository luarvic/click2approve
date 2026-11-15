import App from "@/app/App";
import { Routes } from "@/shared/routing/routes";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const configuration = vi.hoisted(() => ({ edition: "OpenSource", guestApprovals: false }));

vi.mock("@/shared/analytics/AnalyticsBanner", () => ({
  default: () => <div data-testid="shared-analytics" />,
}));

vi.mock("@/features/applicationConfiguration/api/applicationConfigurationApi", () => ({
  getApplicationConfiguration: vi.fn(async () => ({
    edition: configuration.edition,
    requiresConfirmedEmail: false,
    siteLinks: configuration.edition === "Business" ? { termsUrl: "/terms/", privacyUrl: "/privacy/" } : {},
    capabilities: {
      tenants: false,
      guestApprovals: configuration.guestApprovals,
    },
  })),
}));

describe("<App />", () => {
  beforeEach(() => {
    configuration.guestApprovals = false;
    window.history.replaceState(null, "", Routes.applicationPath("/signIn"));
  });

  afterEach(cleanup);

  test.each([
    ["OpenSource", "/docs/"],
    ["Business", "/docs/"],
  ])("%s app shows its branding and Docs destination", async (edition, documentationPath) => {
    configuration.edition = edition;
    const wrapper = render(<App />);
    expect(wrapper).toBeTruthy();

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Sign in");
    expect(screen.getByRole("button", { name: "Click2Approve home" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Show help" })).toBeNull();
    const brand = screen.getByRole("button", { name: "Click2Approve home" });
    expect(within(brand).getByText("Click2Approve")).toBeTruthy();
    expect(within(brand).getByText(edition === "OpenSource" ? "Free" : "App")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Docs" }).getAttribute("href")).toBe(documentationPath);
    expect(Boolean(screen.queryByRole("link", { name: "Terms" }))).toBe(edition === "Business");
    expect(Boolean(screen.queryByRole("link", { name: "Privacy" }))).toBe(edition === "Business");
    expect(screen.getByRole("link", { name: edition === "OpenSource" ? "Community help" : "Contact" })).toBeTruthy();
  });

  test("keeps shared analytics mounted on guest task pages", async () => {
    configuration.edition = "Business";
    configuration.guestApprovals = true;
    history.replaceState(null, "", Routes.applicationPath("/guest/tasks/private-task#token=private-token"));
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1, name: "Review document" })).toBeTruthy();
    expect(screen.getByTestId("shared-analytics")).toBeTruthy();
  });
});
