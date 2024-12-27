import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, test } from "vitest";
import App from "../App";

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

  test("App mounts properly", () => {
    const wrapper = render(<App />);
    expect(wrapper).toBeTruthy();

    // Get by h6
    const h6 = wrapper.container.querySelector("h6");
    expect(h6?.textContent).toBe("click2approve");

    // Get by text using the React testing library
    const text = screen.getByText(/click2approve/i);
    expect(text.textContent).toBeTruthy();
  });
});
