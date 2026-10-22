import { stores } from "@/app/rootStore";
import { getMfaStatus, manageTwoFactor } from "@/features/identity/api/mfaApi";
import MfaSettings from "@/features/identity/components/MfaSettings";
import { TwoFactorResponse } from "@/features/identity/models/mfa";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("@/app/rootStore", () => ({
  stores: {
    commonStore: { updateActionLoadingCounter: vi.fn() },
    userAccountStore: { currentUser: { email: "person@example.com" }, signOut: vi.fn() },
  },
}));
vi.mock("@/features/identity/api/mfaApi", () => ({ getMfaStatus: vi.fn(), manageTwoFactor: vi.fn() }));
const setup: TwoFactorResponse = {
  sharedKey: "SECRET",
  recoveryCodes: null,
  recoveryCodesLeft: 0,
  isTwoFactorEnabled: false,
  isMachineRemembered: false,
};
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getMfaStatus).mockResolvedValue({ enabled: false, isAvailable: true });
  vi.mocked(manageTwoFactor).mockResolvedValue(setup);
});
afterEach(cleanup);

test("enrolls using the existing QR component and requires saving recovery codes", async () => {
  render(<MfaSettings />);
  fireEvent.click(await screen.findByLabelText("Use multi-factor authentication"));
  expect(manageTwoFactor).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect((await screen.findByRole<HTMLTextAreaElement>("textbox", { name: "Setup key" })).value).toBe("SECRET");
  expect(document.querySelector("svg title")?.textContent).toBe("Authenticator setup QR code");
  vi.mocked(manageTwoFactor).mockResolvedValue({ ...setup, isTwoFactorEnabled: true, recoveryCodes: ["ABCDE-12345"] });
  fireEvent.change(screen.getByLabelText("Verification code from your authenticator app"), {
    target: { value: "012345" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enable MFA" }));
  expect((await screen.findByRole<HTMLTextAreaElement>("textbox", { name: "Recovery codes" })).value).toBe(
    "ABCDE-12345",
  );
  expect(manageTwoFactor).toHaveBeenLastCalledWith({ enable: true, twoFactorCode: "012345", resetRecoveryCodes: true });
  expect(screen.getByRole<HTMLButtonElement>("button", { name: "Done — sign in again" }).disabled).toBe(true);
  expect(stores.userAccountStore.signOut).not.toHaveBeenCalled();
  fireEvent.click(screen.getByLabelText("I have saved my recovery codes"));
  fireEvent.click(screen.getByRole("button", { name: "Done — sign in again" }));
  expect(stores.userAccountStore.signOut).toHaveBeenCalledOnce();
});

test("leaves invalid setup open for another code", async () => {
  render(<MfaSettings />);
  fireEvent.click(await screen.findByLabelText("Use multi-factor authentication"));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect((await screen.findByRole<HTMLTextAreaElement>("textbox", { name: "Setup key" })).value).toBe("SECRET");
  vi.mocked(manageTwoFactor).mockResolvedValue(null);
  fireEvent.change(screen.getByLabelText("Verification code from your authenticator app"), {
    target: { value: "000000" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enable MFA" }));
  await waitFor(() => expect(manageTwoFactor).toHaveBeenCalledTimes(2));
  expect(screen.getByLabelText("Verification code from your authenticator app")).toBeTruthy();
  expect(stores.userAccountStore.signOut).not.toHaveBeenCalled();
});

test("requires confirmation before disabling MFA", async () => {
  vi.mocked(getMfaStatus).mockResolvedValue({ enabled: true, isAvailable: true });
  render(<MfaSettings />);
  fireEvent.click(await screen.findByLabelText("Use multi-factor authentication"));
  expect(manageTwoFactor).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Turn off MFA" }));
  await waitFor(() => expect(stores.userAccountStore.signOut).toHaveBeenCalledOnce());
  expect(manageTwoFactor).toHaveBeenCalledWith({ enable: false, forgetMachine: true });
});

test("does not expose setup when verification is disabled", async () => {
  vi.mocked(getMfaStatus).mockResolvedValue({ enabled: true, isAvailable: false });
  render(<MfaSettings />);
  expect((await screen.findByLabelText<HTMLInputElement>("Use multi-factor authentication")).disabled).toBe(true);
  expect(manageTwoFactor).not.toHaveBeenCalled();
});
