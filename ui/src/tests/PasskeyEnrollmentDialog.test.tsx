import { stores } from "@/app/rootStore";
import PasskeyEnrollmentDialog from "@/features/identity/components/PasskeyEnrollmentDialog";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { runInAction } from "mobx";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { listPasskeys, registerPasskey } = vi.hoisted(() => ({
  listPasskeys: vi.fn(),
  registerPasskey: vi.fn(),
}));

vi.mock("@/app/rootStore", async () => {
  const { makeAutoObservable } = await import("mobx");
  const userAccountStore = makeAutoObservable({
    currentUser: { email: "person@example.com" },
    passkeyEnrollmentPending: true,
    completePasskeyEnrollmentPrompt: () => {
      userAccountStore.passkeyEnrollmentPending = false;
    },
  });
  return {
    stores: {
      commonStore: {
        updateActionLoadingCounter: vi.fn(),
      },
      userAccountStore,
    },
  };
});

vi.mock("@/features/identity/api/passkeysApi", () => ({
  browserSupportsPasskeys: () => true,
  listPasskeys,
  registerPasskey,
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  runInAction(() => {
    stores.userAccountStore.passkeyEnrollmentPending = true;
  });
  listPasskeys.mockResolvedValue([]);
  registerPasskey.mockResolvedValue(true);
});
afterEach(cleanup);

test("does not show the passkey prompt after the user opts out", async () => {
  const { rerender } = render(<PasskeyEnrollmentDialog />);
  await screen.findByRole("heading", { name: "Add a passkey" });

  fireEvent.click(screen.getByRole("checkbox", { name: "Don't show this again" }));
  fireEvent.click(screen.getByRole("button", { name: "Not now" }));
  await waitFor(() => expect(screen.queryByRole("heading", { name: "Add a passkey" })).toBeNull());

  act(() => {
    runInAction(() => {
      stores.userAccountStore.passkeyEnrollmentPending = true;
    });
  });
  rerender(<PasskeyEnrollmentDialog />);

  await waitFor(() => expect(screen.queryByRole("heading", { name: "Add a passkey" })).toBeNull());
});

test("adds a passkey from the prompt", async () => {
  render(<PasskeyEnrollmentDialog />);
  await screen.findByRole("heading", { name: "Add a passkey" });

  fireEvent.click(screen.getByRole("button", { name: "Add passkey" }));

  await waitFor(() => expect(registerPasskey).toHaveBeenCalledWith("This device"));
  await waitFor(() => expect(screen.queryByRole("heading", { name: "Add a passkey" })).toBeNull());
});

test("stays idle for restored sessions and reacts to an explicit sign-in", async () => {
  runInAction(() => {
    stores.userAccountStore.passkeyEnrollmentPending = false;
  });
  render(<PasskeyEnrollmentDialog />);
  expect(listPasskeys).not.toHaveBeenCalled();
  expect(screen.queryByRole("heading", { name: "Add a passkey" })).toBeNull();
  act(() => {
    runInAction(() => {
      stores.userAccountStore.passkeyEnrollmentPending = true;
    });
  });
  await screen.findByRole("heading", { name: "Add a passkey" });
});

test("ignores an eligibility response after the session prompt is cleared", async () => {
  let resolvePasskeys!: (value: []) => void;
  listPasskeys.mockReturnValue(
    new Promise<[]>((resolve) => {
      resolvePasskeys = resolve;
    }),
  );
  render(<PasskeyEnrollmentDialog />);
  act(() => stores.userAccountStore.completePasskeyEnrollmentPrompt());
  await act(async () => {
    resolvePasskeys([]);
  });
  expect(screen.queryByRole("heading", { name: "Add a passkey" })).toBeNull();
});
