import NewReceiptLinkDialog from "@/features/receipts/components/NewReceiptLinkDialog";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { cleanup, fireEvent, render as renderComponent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { afterEach, expect, test, vi } from "vitest";

const render = (component: ReactElement) =>
  renderComponent(<LocalizationProvider dateAdapter={AdapterDayjs}>{component}</LocalizationProvider>);

afterEach(cleanup);

test("defaults expiration to 30 days and submits an absolute date", async () => {
  const onCreate = vi.fn().mockResolvedValue(true);
  const onClose = vi.fn();
  render(<NewReceiptLinkDialog loading={false} onClose={onClose} onCreate={onCreate} />);
  expect(screen.getByRole("button", { name: /Choose date/ })).toBeTruthy();
  const date = new Date(
    Number(screen.getByRole("spinbutton", { name: "Year" }).getAttribute("aria-valuenow")),
    Number(screen.getByRole("spinbutton", { name: "Month" }).getAttribute("aria-valuenow")) - 1,
    Number(screen.getByRole("spinbutton", { name: "Day" }).getAttribute("aria-valuenow")),
  );
  date.setHours(23, 59, 59, 999);
  const expected = new Date();
  expected.setDate(expected.getDate() + 30);
  expected.setHours(23, 59, 59, 999);
  expect(date.getTime()).toBe(expected.getTime());
  fireEvent.click(screen.getByRole("button", { name: "Create link" }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(onCreate).toHaveBeenCalledWith(date);
});

test("rejects past expiration and keeps the dialog open after API failure", async () => {
  const onCreate = vi.fn().mockResolvedValue(false);
  const onClose = vi.fn();
  render(<NewReceiptLinkDialog loading={false} onClose={onClose} onCreate={onCreate} />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("spinbutton", { name: "Year" }));
  await user.keyboard("2000");
  fireEvent.click(screen.getByRole("button", { name: "Create link" }));
  expect(await screen.findByText("Choose today or a future date.")).toBeTruthy();
  expect(onCreate).not.toHaveBeenCalled();
  await user.click(screen.getByRole("spinbutton", { name: "Year" }));
  await user.keyboard("2099");
  fireEvent.click(screen.getByRole("button", { name: "Create link" }));
  await waitFor(() => expect(onCreate).toHaveBeenCalledOnce());
  expect(onClose).not.toHaveBeenCalled();
});
