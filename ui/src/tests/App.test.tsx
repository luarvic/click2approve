import App from "@/app/App";
import { Routes } from "@/shared/routing/routes";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

const configuration = vi.hoisted(() => ({ edition: "OpenSource" }));

vi.mock("@/features/applicationConfiguration/api/applicationConfigurationApi", () => ({
  getApplicationConfiguration: vi.fn(async () => ({
    edition: configuration.edition,
    requiresConfirmedEmail: false,
    capabilities: {
      tenants: false,
    },
  })),
}));

describe("<App />", () => {
  beforeAll(() => {
    window.history.replaceState(null, "", Routes.applicationPath("/signIn"));
  });

  afterEach(cleanup);

  test.each([
    ["OpenSource", true, "/docs/open-source/"],
    ["Business", false, "/docs/"],
  ])("%s app shows its branding and Docs destination", async (edition, isOpenSource, documentationPath) => {
    configuration.edition = edition;
    const wrapper = render(<App />);
    expect(wrapper).toBeTruthy();

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Sign in");
    expect(screen.getByRole("button", { name: "Click2Approve home" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Show help" })).toBeNull();
    const brand = screen.getByRole("button", { name: "Click2Approve home" });
    expect(within(brand).getByText(isOpenSource ? "Free" : "App")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Docs" }).getAttribute("href")).toBe(documentationPath);
  });
});
