import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

describe("<CloseOnEscape />", () => {
  test("closes when Escape is pressed outside its content", () => {
    const onClose = vi.fn();

    render(
      <CloseOnEscape onClose={onClose}>
        <button type="button">Close record</button>
      </CloseOnEscape>,
    );

    fireEvent.keyDown(document, {
      key: "Escape",
    });

    expect(onClose).toHaveBeenCalledOnce();
  });

  test("does not close when a nested control handles Escape", () => {
    const onClose = vi.fn();

    render(
      <CloseOnEscape onClose={onClose}>
        <button type="button" onKeyDown={(event) => event.preventDefault()}>
          Nested control
        </button>
      </CloseOnEscape>,
    );

    fireEvent.keyDown(screen.getByRole("button", { name: "Nested control" }), {
      key: "Escape",
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
