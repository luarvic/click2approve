import { stores } from "@/app/rootStore";
import SignUpPage from "@/features/identity/pages/SignUpPage";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { runInAction } from "mobx";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("@/app/rootStore", async () => {
  const { observable } = await import("mobx");
  return {
    stores: {
      commonStore: { updateActionLoadingCounter: vi.fn() },
      userAccountStore: { signUp: vi.fn().mockResolvedValue(false) },
      applicationConfigurationStore: observable({ registrationLegal: null }),
    },
  };
});

const policy = {
  termsVersion: "draft-2026-10-18",
  termsUrl: "/terms/",
  privacyVersion: "draft-2026-10-18",
  privacyUrl: "/privacy/",
};
beforeEach(() => {
  vi.clearAllMocks();
  runInAction(() => Object.assign(stores.applicationConfigurationStore, { registrationLegal: policy }));
});
afterEach(cleanup);

const renderForm = () => {
  const view = render(
    <MemoryRouter>
      <SignUpPage />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: "person@example.com" } });
  fireEvent.change(document.querySelector('input[name="password"]')!, { target: { value: "StrongPassword1!" } });
  fireEvent.change(document.querySelector('input[name="passwordConfirmation"]')!, {
    target: { value: "StrongPassword1!" },
  });
  return view;
};
const submit = () => fireEvent.submit(screen.getByRole("button", { name: "Sign up" }).closest("form")!);

test("requires unchecked acknowledgement and preserves credentials", async () => {
  renderForm();
  const checkbox = screen.getByRole("checkbox", { name: /I agree to the/ }) as HTMLInputElement;
  expect(checkbox.checked).toBe(false);
  expect((screen.getByRole("button", { name: "Sign up" }) as HTMLButtonElement).disabled).toBe(true);
  expect(checkbox.closest("label")?.textContent).not.toContain("*");
  expect(screen.getByRole("link", { name: "Terms" }).getAttribute("href")).toBe("/terms/");
  expect(screen.getByRole("link", { name: "Privacy Policy" }).getAttribute("target")).toBe("_blank");
  submit();
  expect(stores.userAccountStore.signUp).not.toHaveBeenCalled();
  expect(screen.getByText("Agree to the Terms and acknowledge the Privacy Policy to continue.")).toBeTruthy();
  fireEvent.click(checkbox);
  expect((screen.getByRole("button", { name: "Sign up" }) as HTMLButtonElement).disabled).toBe(false);
  fireEvent.click(checkbox);
  expect((screen.getByRole("button", { name: "Sign up" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(checkbox);
  submit();
  await waitFor(() =>
    expect(stores.userAccountStore.signUp).toHaveBeenCalledWith(
      expect.objectContaining({ email: "person@example.com", password: "StrongPassword1!" }),
      policy,
    ),
  );
});

test("does not require hosted-service acknowledgement without a backend policy", async () => {
  runInAction(() => Object.assign(stores.applicationConfigurationStore, { registrationLegal: null }));
  renderForm();
  expect(screen.queryByRole("checkbox")).toBeNull();
  expect((screen.getByRole("button", { name: "Sign up" }) as HTMLButtonElement).disabled).toBe(false);
  submit();
  await waitFor(() => expect(stores.userAccountStore.signUp).toHaveBeenCalledWith(expect.anything(), null));
});

test("a changed document version requires a fresh acknowledgement", () => {
  const view = renderForm();
  fireEvent.click(screen.getByRole("checkbox"));
  act(() =>
    runInAction(() =>
      Object.assign(stores.applicationConfigurationStore, {
        registrationLegal: { ...policy, termsVersion: "new-version" },
      }),
    ),
  );
  view.rerender(
    <MemoryRouter>
      <SignUpPage />
    </MemoryRouter>,
  );
  expect((screen.getByRole("checkbox") as HTMLInputElement).checked).toBe(false);
  expect((screen.getByRole("button", { name: "Sign up" }) as HTMLButtonElement).disabled).toBe(true);
  submit();
  expect(stores.userAccountStore.signUp).not.toHaveBeenCalled();
});
