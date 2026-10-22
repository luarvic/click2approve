import ReceiptLinksGrid from "@/features/receipts/components/ReceiptLinksGrid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { cleanup, fireEvent, render as renderComponent, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const render = (component: ReactElement) =>
  renderComponent(<LocalizationProvider dateAdapter={AdapterDayjs}>{component}</LocalizationProvider>);

const { getReceipt, createReceiptLink, deleteReceiptLink } = vi.hoisted(() => ({
  getReceipt: vi.fn(),
  createReceiptLink: vi.fn(),
  deleteReceiptLink: vi.fn(),
}));
vi.mock("@/features/receipts/api/receiptsApi", () => ({ getReceipt, createReceiptLink, deleteReceiptLink }));
vi.mock("@/app/rootStore", () => ({
  stores: {
    commonStore: {
      updateActionLoadingCounter: vi.fn(),
      isActionLoading: () => false,
    },
  },
}));
vi.mock("@/shared/hooks/useGridRefresh", async () => {
  const { useEffect, useRef } = await import("react");
  return {
    useGridRefresh: (load: () => Promise<void>, version: number) => {
      const loadRef = useRef(load);
      loadRef.current = load;
      useEffect(() => {
        void loadRef.current();
      }, [version]);
      return false;
    },
  };
});
vi.mock("@/shared/utils/notifications", () => ({
  notification: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
  getReceipt.mockResolvedValue({
    canManageLinks: true,
    links: [
      { globalId: "active-link", createdAt: new Date(), expiresAt: new Date("2099-01-01") },
      { globalId: "expired-link", createdAt: new Date(), expiresAt: new Date("2000-01-01") },
    ],
  });
});
afterEach(cleanup);

test("shows link identifiers without status or open actions and enables removal after selection", async () => {
  render(<ReceiptLinksGrid receiptGlobalId="receipt" tenantGlobalId="tenant" />);
  await screen.findByText("expired-link");
  expect(screen.queryByText("Open link")).toBeNull();
  expect(screen.queryByRole("columnheader", { name: "Status" })).toBeNull();
  expect(screen.getByRole("button", { name: "active-link" })).toBeTruthy();
  expect((screen.getByRole("button", { name: "Remove" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
  await waitFor(() =>
    expect((screen.getByRole("button", { name: "Remove" }) as HTMLButtonElement).disabled).toBe(false),
  );
  fireEvent.click(screen.getByRole("button", { name: "New link" }));
  expect(await screen.findByRole("heading", { name: "New receipt link" })).toBeTruthy();
});

test("removes selected links and refreshes even when one removal fails", async () => {
  deleteReceiptLink.mockImplementation(async (_tenant: string, _receipt: string, id: string) => id === "active-link");
  render(<ReceiptLinksGrid receiptGlobalId="receipt" tenantGlobalId="tenant" />);
  await screen.findByText("expired-link");
  fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  const dialog = await screen.findByRole("dialog");
  const remove = Array.from(dialog.querySelectorAll("button")).find((button) => button.textContent === "Remove")!;
  fireEvent.click(remove);
  await waitFor(() => expect(deleteReceiptLink).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(getReceipt).toHaveBeenCalledTimes(2));
  expect(deleteReceiptLink).toHaveBeenCalledWith("tenant", "receipt", "active-link");
  expect(deleteReceiptLink).toHaveBeenCalledWith("tenant", "receipt", "expired-link");
  expect(screen.getByRole("dialog")).toBeTruthy();
});

test("opens the shared copy field when a link is clicked", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  render(<ReceiptLinksGrid receiptGlobalId="receipt" tenantGlobalId="tenant" />);
  fireEvent.click(await screen.findByRole("button", { name: "active-link" }));
  expect(await screen.findByRole("heading", { name: "Receipt verification link" })).toBeTruthy();
  const url = `${window.location.origin}/app/receipt-verification/active-link`;
  expect((screen.getByRole("textbox", { name: "Verification link" }) as HTMLTextAreaElement).value).toBe(url);
  fireEvent.click(screen.getByRole("button", { name: "Copy Verification link" }));
  await waitFor(() => expect(writeText).toHaveBeenCalledWith(url));
});
