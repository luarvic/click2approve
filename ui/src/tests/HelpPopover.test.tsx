import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("<HelpPopover />", () => {
  test("opens the help text", () => {
    render(<HelpPopover helpText="Tasks help text" />);

    fireEvent.click(screen.getByLabelText("Show help"));
    expect(screen.getByText("Tasks help text")).toBeTruthy();
  });
});
