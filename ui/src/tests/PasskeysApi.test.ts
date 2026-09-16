import { registerPasskey, signInWithPasskey } from "@/features/identity/api/passkeysApi";
import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  error: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/shared/api/axios", () => ({
  default: { post: mocks.post },
}));

vi.mock("@/shared/utils/notifications", () => ({
  notification: { error: mocks.error },
}));

describe("passkey API error notifications", () => {
  beforeEach(() => vi.clearAllMocks());

  test.each([
    ["registration", () => registerPasskey("This device")],
    ["sign-in", signInWithPasskey],
  ])("formats a payment-required error during passkey %s", async (_, action) => {
    const error = Object.assign(new Error("Request failed with status code 402"), {
      isAxiosError: true,
      response: { status: 402 },
    });
    mocks.post.mockRejectedValue(error);

    await expect(action()).resolves.toBe(false);

    expect(mocks.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Payment is required to continue. Please review your organization's plan.",
        severity: "warning",
      }),
    );
  });
});
