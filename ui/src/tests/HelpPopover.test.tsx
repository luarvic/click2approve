import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("<HelpPopover />", () => {
  test("opens the help text", () => {
    render(<HelpPopover helpText="Tasks help text" />);

    fireEvent.click(screen.getByLabelText("Show help"));
    expect(screen.getByText("Tasks help text")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  test("opens the corresponding guide in a separate tab", () => {
    render(<HelpPopover docsHref="/docs/complete-a-task/" helpText="Review the task before acting." />);

    expect(screen.queryByRole("link")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Show help" }));

    const link = screen.getByRole("link", { name: "Read documentation (opens in a new tab)" });
    expect(link.getAttribute("href")).toBe("/docs/complete-a-task/");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
