import App from "@/app/App";
import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";

vi.mock("@/features/product/api/productsApi", () => ({
  getProductInfo: vi.fn().mockResolvedValue({
    edition: "OpenSource",
    requiresConfirmedEmail: false,
    capabilities: {
      tenants: false,
    },
  }),
}));

describe("<App />", () => {
  beforeAll(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        pathname: "/ui/signIn",
        origin: "http://localhost",
        href: "http://localhost/ui/signIn",
      },
    });
  });

  test("App mounts properly", async () => {
    const wrapper = render(<App />);
    expect(wrapper).toBeTruthy();

    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Sign in");
    expect(
      screen.queryByRole("heading", { level: 6, name: "Click2Approve" }),
    ).toBeNull();
  });
});
