import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test, vi } from "vitest";
import App from "../App";

vi.mock("../lib/controllers/product", () => ({
  productInfo: vi.fn().mockResolvedValue({
    edition: "OpenSource",
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
        pathname: "/ui",
        origin: "http://localhost",
        href: "http://localhost/ui",
      },
    });
  });

  test("App mounts properly", async () => {
    const wrapper = render(<App />);
    expect(wrapper).toBeTruthy();

    const heading = await screen.findByRole("heading", { level: 6 });
    expect(heading.textContent).toBe("click2approve");
  });
});
