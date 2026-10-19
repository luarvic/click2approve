import App from "@/app/App";
import { Routes } from "@/shared/routing/routes";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

vi.mock("@/features/applicationConfiguration/api/applicationConfigurationApi", () => ({
  getApplicationConfiguration: vi.fn().mockResolvedValue({
    edition: "OpenSource",
    requiresConfirmedEmail: false,
    capabilities: {
      tenants: false,
    },
  }),
}));

describe("<App />", () => {
  beforeAll(() => {
    window.history.replaceState(null, "", Routes.applicationPath("/signIn"));
  });

  test("App mounts properly", async () => {
    const wrapper = render(<App />);
    expect(wrapper).toBeTruthy();

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Sign in");
    expect(screen.getByRole("button", { name: "Click2Approve home" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Show help" })).toBeNull();
    expect(screen.getByRole("link", { name: "Docs" }).getAttribute("href")).toBe("/docs/");
  });
});
