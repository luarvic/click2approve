import { deletePasskey, registerPasskey, signInWithPasskey } from "@/features/identity/api/passkeysApi";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  delete: vi.fn(),
  error: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/shared/api/axios", () => ({
  default: { delete: mocks.delete, post: mocks.post },
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

describe("passkey removal", () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  test("signals only the removed credential after successful server deletion using the configured RP ID", async () => {
    const signalUnknownCredential = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("PublicKeyCredential", { signalUnknownCredential });
    mocks.delete.mockImplementation(async () => {
      expect(signalUnknownCredential).not.toHaveBeenCalled();
      return { data: { rpId: "example.com" } };
    });

    await expect(deletePasskey("AQID")).resolves.toBe(true);

    expect(mocks.delete).toHaveBeenCalledWith("api/v1/account/passkeys/AQID");
    expect(signalUnknownCredential).toHaveBeenCalledExactlyOnceWith({ credentialId: "AQID", rpId: "example.com" });
    expect(mocks.error).not.toHaveBeenCalled();
  });

  test.each([undefined, {}])("removes the passkey when the browser does not support signals (%s)", async (api) => {
    vi.stubGlobal("PublicKeyCredential", api);
    mocks.delete.mockResolvedValue({ data: { rpId: "example.com" } });

    await expect(deletePasskey("AQID")).resolves.toBe(true);
    expect(mocks.error).not.toHaveBeenCalled();
  });

  test("keeps server removal successful when the provider rejects the signal", async () => {
    vi.stubGlobal("PublicKeyCredential", {
      signalUnknownCredential: vi.fn().mockRejectedValue(new Error("Provider unavailable")),
    });
    mocks.delete.mockResolvedValue({ data: { rpId: "example.com" } });

    await expect(deletePasskey("AQID")).resolves.toBe(true);
    expect(mocks.error).not.toHaveBeenCalled();
  });

  test("never signals removal when server deletion fails", async () => {
    const signalUnknownCredential = vi.fn();
    vi.stubGlobal("PublicKeyCredential", { signalUnknownCredential });
    mocks.delete.mockRejectedValue(new Error("Removal failed"));

    await expect(deletePasskey("AQID")).resolves.toBe(false);
    expect(signalUnknownCredential).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalledOnce();
  });
});
