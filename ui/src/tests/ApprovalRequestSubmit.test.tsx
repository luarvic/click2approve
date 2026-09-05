import { stores } from "@/app/rootStore";
import ApprovalRequestSubmit from "@/features/approvalRequests/components/ApprovalRequestSubmit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const renderCompose = (onClose = vi.fn()) => {
  const router = createMemoryRouter([{ path: "*", element: <ApprovalRequestSubmit onClose={onClose} /> }]);
  return render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);
};

describe("request composition", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  beforeEach(() =>
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    ),
  );
  beforeEach(() => {
    sessionStorage.clear();
    runInAction(() => {
      stores.tenantStore.currentTenantGlobalId = "tenant-a";
      stores.userAccountStore.currentUser = { email: "alice@example.com", isEmailConfirmed: true };
      stores.approvalRequestStore.requestToClone = null;
    });
  });

  test("shows inline requirements and focuses the title after invalid submission", async () => {
    const user = userEvent.setup();
    renderCompose();
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByText("Title is required.")).toBeTruthy();
    expect(screen.getByText("Attach at least one file for approval.").getAttribute("role")).toBe("alert");
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("textbox", { name: /Title/ })));
    await user.type(screen.getByRole("textbox", { name: /Title/ }), "Budget");
    expect(screen.queryByText("Title is required.")).toBeNull();
  });

  test("warns before discarding edits without saving or restoring a draft", async () => {
    const user = userEvent.setup();
    const confirm = vi.mocked(window.confirm);
    const onClose = vi.fn();
    const view = renderCompose(onClose);
    await user.type(screen.getByRole("textbox", { name: /Title/ }), "Quarterly budget");
    await user.keyboard("{Escape}");
    expect(confirm).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
    expect((screen.getByRole("textbox", { name: /Title/ }) as HTMLInputElement).value).toBe("Quarterly budget");
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(sessionStorage.length).toBe(0);
    view.unmount();
    renderCompose();
    expect((screen.getByRole("textbox", { name: /Title/ }) as HTMLInputElement).value).toBe("");
  });
  test("leaves an untouched form without a warning", async () => {
    const user = userEvent.setup();
    const confirm = vi.mocked(window.confirm);
    const onClose = vi.fn();
    renderCompose(onClose);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(confirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
