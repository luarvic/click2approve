import { FieldLimits } from "@/shared/config/fieldLimits";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { emailRule, futureDateRule, signatureRule, textRule, urlRule } from "@/shared/utils/formValidation";
import { notification } from "@/shared/utils/notifications";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("form validation", () => {
  it("accepts limits and rejects whitespace and oversized values", () => {
    const rule = textRule("Name", FieldLimits.name, true);
    expect(rule("x".repeat(255))).toBeUndefined();
    expect(rule("x".repeat(256))).toContain("255");
    expect(rule("   ")).toContain("required");
    expect(emailRule()("invalid")).toBeDefined();
    expect(urlRule("javascript:alert(1)")).toBeDefined();
    expect(urlRule("https://example.com")).toBeUndefined();
    expect(futureDateRule()("invalid")).toBeDefined();
    expect(signatureRule("[]")).toBeDefined();
    expect(signatureRule('[{"points":[{"x":1,"y":2}]}]')).toBeUndefined();
  });

  it("shows errors only after submit and clears them when edited", () => {
    const { result, rerender } = renderHook(
      ({ name }) => useFormValidation({ name }, { name: textRule("Name", 255, true) }),
      { initialProps: { name: "" } },
    );
    expect(result.current.field("name").error).toBe(false);
    act(() => {
      expect(result.current.validate()).toBe(false);
    });
    expect(result.current.field("name").error).toBe(true);
    rerender({ name: "edited" });
    expect(result.current.field("name").error).toBe(false);
    rerender({ name: "" });
    expect(result.current.field("name").error).toBe(false);
  });

  it("maps server errors during the save and ignores later unrelated failures", async () => {
    const { result } = renderHook(() => useFormValidation({ name: "Team" }, { name: textRule("Name", 255, true) }));
    await act(async () => {
      await result.current.run(async () =>
        notification.error({
          message: "Invalid input",
          details: [{ label: "Validation error: Name", value: "Already used." }],
        }),
      );
    });
    expect(result.current.field("name").helperText).toBe("Already used.");
    act(() =>
      notification.error({ message: "Other", details: [{ label: "Validation error: Name", value: "Other request." }] }),
    );
    expect(result.current.field("name").helperText).toBe("Already used.");
  });
});
