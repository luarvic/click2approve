import PasskeyEnrollmentDialog from "@/features/identity/components/PasskeyEnrollmentDialog";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { listPasskeys, registerPasskey } = vi.hoisted(() => ({
  listPasskeys: vi.fn(),
  registerPasskey: vi.fn(),
}));

vi.mock("@/features/identity/api/passkeysApi", () => ({
  browserSupportsPasskeys: () => true,
  listPasskeys,
  registerPasskey,
}));

beforeEach(() => {
  localStorage.clear();
  listPasskeys.mockResolvedValue([]);
  registerPasskey.mockResolvedValue(true);
});
afterEach(cleanup);

test("does not show the passkey prompt after the user opts out", async () => {
  const { rerender } = render(<PasskeyEnrollmentDialog email="person@example.com" />);
  await screen.findByRole("heading", { name: "Add a passkey" });

  fireEvent.click(screen.getByRole("checkbox", { name: "Don't show this again" }));
  fireEvent.click(screen.getByRole("button", { name: "Not now" }));
  await waitFor(() => expect(screen.queryByRole("heading", { name: "Add a passkey" })).toBeNull());

  rerender(<PasskeyEnrollmentDialog email={undefined} />);
  rerender(<PasskeyEnrollmentDialog email="person@example.com" />);

  await waitFor(() => expect(screen.queryByRole("heading", { name: "Add a passkey" })).toBeNull());
});

test("adds a passkey from the prompt", async () => {
  render(<PasskeyEnrollmentDialog email="person@example.com" />);
  await screen.findByRole("heading", { name: "Add a passkey" });

  fireEvent.click(screen.getByRole("button", { name: "Add passkey" }));

  await waitFor(() => expect(registerPasskey).toHaveBeenCalledWith("This device"));
  await waitFor(() => expect(screen.queryByRole("heading", { name: "Add a passkey" })).toBeNull());
});
