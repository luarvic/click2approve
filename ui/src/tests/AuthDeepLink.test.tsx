import { stores } from "@/app/rootStore";
import ConfirmEmailPage from "@/features/identity/pages/ConfirmEmailPage";
import ConfirmationEmailSentPage from "@/features/identity/pages/ConfirmationEmailSentPage";
import ForgotPasswordPage from "@/features/identity/pages/ForgotPasswordPage";
import PasswordResetCompletePage from "@/features/identity/pages/PasswordResetCompletePage";
import PasswordResetEmailSentPage from "@/features/identity/pages/PasswordResetEmailSentPage";
import ResendConfirmationEmailPage from "@/features/identity/pages/ResendConfirmationEmailPage";
import ResetPasswordPage from "@/features/identity/pages/ResetPasswordPage";
import SignInPage from "@/features/identity/pages/SignInPage";
import SignUpPage from "@/features/identity/pages/SignUpPage";
import AnonymousRoute from "@/shared/components/routing/AnonymousRoute";
import RouteGuard from "@/shared/components/routing/RouteGuard";
import SessionVerificationGuard from "@/shared/components/routing/SessionVerificationGuard";
import { notification } from "@/shared/utils/notifications";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { runInAction } from "mobx";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("@/app/rootStore", async () => {
  const { observable } = await import("mobx");
  return {
    stores: {
      commonStore: { updateActionLoadingCounter: vi.fn() },
      userAccountStore: observable(
        {
          currentUser: null,
          isManualSignOut: false,
          clearManualSignOut: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
          resetPassword: vi.fn(),
          sendResetPasswordLink: vi.fn(),
          resendConfirmationEmail: vi.fn(),
          signUp: vi.fn(),
          signInWithPasskey: vi.fn(),
          signInWithCachedToken: vi.fn(),
        },
        {
          resendConfirmationEmail: false,
          resetPassword: false,
          sendResetPasswordLink: false,
          signOut: false,
          signIn: false,
          signUp: false,
          signInWithPasskey: false,
          signInWithCachedToken: false,
        },
      ),
      applicationConfigurationStore: { requiresConfirmedEmail: false },
    },
  };
});
vi.mock("@/features/identity/api/passkeysApi", () => ({
  browserSupportsPasskeys: () => true,
}));
vi.mock("@/features/identity/api/authApi", () => ({
  confirmUserEmail: vi.fn().mockResolvedValue(true),
  loginUser: vi.fn().mockResolvedValue(true),
}));

const destination =
  "/tenants/f08eb8f4-4a49-484a-af9d-ca7bd918ea07/tasks/90de3e09-ea64-4f93-bf7a-4b9a4f49ab0d?view=full#details";

const renderFlow = (initialEntry = destination) => {
  const router = createMemoryRouter(
    [
      {
        element: <SessionVerificationGuard />,
        children: [
          {
            element: <RouteGuard />,
            children: [
              { path: "/", element: <p>Home</p> },
              {
                path: "/tenants/:tenantGlobalId/tasks/:taskGlobalId",
                element: <p>Task detail</p>,
              },
            ],
          },
          {
            element: <AnonymousRoute />,
            children: [
              { path: "/signIn", element: <SignInPage /> },
              { path: "/signUp", element: <SignUpPage /> },
              { path: "/resendConfirmationEmail", element: <ResendConfirmationEmailPage /> },
            ],
          },
          { path: "/resetPassword", element: <ResetPasswordPage /> },
          { path: "/confirmEmail", element: <ConfirmEmailPage /> },
          { path: "/passwordResetComplete", element: <PasswordResetCompletePage /> },
          { path: "/confirmationEmailSent", element: <ConfirmationEmailSentPage /> },
          { path: "/passwordResetEmailSent", element: <PasswordResetEmailSentPage /> },
          { path: "/forgotPassword", element: <ForgotPasswordPage /> },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
  );
  render(<RouterProvider router={router} />);
  return router;
};

const authenticate = async () => {
  runInAction(() => {
    stores.userAccountStore.currentUser = {
      isEmailConfirmed: true,
    } as NonNullable<typeof stores.userAccountStore.currentUser>;
  });
  return true;
};

beforeEach(() => {
  localStorage.clear();
  vi.mocked(stores.userAccountStore.signOut).mockImplementation((isManual = false) => {
    runInAction(() => {
      stores.userAccountStore.isManualSignOut = isManual;
      stores.userAccountStore.currentUser = null;
    });
  });
  runInAction(() => {
    stores.userAccountStore.currentUser = null;
    stores.userAccountStore.isManualSignOut = false;
  });
  (
    stores.applicationConfigurationStore as unknown as {
      requiresConfirmedEmail: boolean;
    }
  ).requiresConfirmedEmail = false;
  vi.mocked(stores.userAccountStore.signIn).mockImplementation(authenticate);
  vi.mocked(stores.userAccountStore.signInWithPasskey).mockImplementation(authenticate);
  vi.mocked(stores.userAccountStore.signUp).mockResolvedValue(true);
});
afterEach(cleanup);

test.each(["password", "passkey"])("opens the original task after %s sign-in", async (method) => {
  const router = renderFlow();
  await screen.findByRole("heading", { name: "Sign in" });
  expect(new URLSearchParams(router.state.location.search).get("returnUrl")).toBe(destination);
  if (method === "passkey") {
    fireEvent.click(screen.getByRole("button", { name: "Sign in with a passkey" }));
  } else {
    fireEvent.change(screen.getByLabelText("Email address", { exact: false }), {
      target: { value: "person@example.com" },
    });
    fireEvent.change(document.querySelector<HTMLInputElement>('input[name="password"]')!, {
      target: { value: "StrongPassword1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  }
  await screen.findByText("Task detail");
  expect(`${router.state.location.pathname}${router.state.location.search}${router.state.location.hash}`).toBe(
    destination,
  );
  expect(localStorage.getItem("authenticationReturnUrl")).toBeNull();
});

test.each(["/", "/signIn"])("ordinary entry at %s keeps authentication links free of return URLs", async (entry) => {
  const router = renderFlow(entry);
  await screen.findByRole("heading", { name: "Sign in" });
  expect(router.state.location.search).toBe("");
  fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
  await screen.findByRole("heading", { name: "Sign up" });
  expect(router.state.location.search).toBe("");
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  await screen.findByRole("heading", { name: "Sign in" });
  expect(router.state.location.search).toBe("");
  expect(localStorage.getItem("authenticationReturnUrl")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Sign in with a passkey" }));
  await screen.findByText("Home");
});

test("opening a protected link while authenticated does not save a return destination", async () => {
  await authenticate();
  renderFlow();
  await screen.findByText("Task detail");
  expect(localStorage.getItem("authenticationReturnUrl")).toBeNull();
});

test("authenticated result pages do not recreate a pending destination from their query", async () => {
  await authenticate();
  renderFlow(`/confirmationEmailSent?returnUrl=${encodeURIComponent(destination)}`);
  await screen.findByRole("heading", { name: "Verify your email" });
  expect(localStorage.getItem("authenticationReturnUrl")).toBeNull();
});

test("offers to resend verification email only after an unconfirmed email sign-in attempt", async () => {
  vi.mocked(stores.userAccountStore.signIn).mockResolvedValue({ requiresEmailConfirmation: true });
  vi.mocked(stores.userAccountStore.resendConfirmationEmail).mockResolvedValue(true);
  renderFlow();
  expect(screen.queryByRole("button", { name: "Resend verification email" })).toBeNull();
  fireEvent.change(screen.getByLabelText("Email address", { exact: false }), {
    target: { value: "person@example.com" },
  });
  fireEvent.change(document.querySelector<HTMLInputElement>('input[name="password"]')!, {
    target: { value: "StrongPassword1!" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  await screen.findByText("Confirm your email before signing in.");
  fireEvent.click(screen.getByRole("button", { name: "Resend verification email" }));
  await screen.findByRole("heading", { name: "Verify your email" });
  expect(stores.userAccountStore.resendConfirmationEmail).toHaveBeenCalledWith("person@example.com");
});

test.each([false, true])(
  "preserves the task through sign-up with confirmation required=%s",
  async (confirmationRequired) => {
    (
      stores.applicationConfigurationStore as unknown as {
        requiresConfirmedEmail: boolean;
      }
    ).requiresConfirmedEmail = confirmationRequired;
    renderFlow();
    fireEvent.click(await screen.findByRole("button", { name: "Sign up" }));
    await screen.findByRole("heading", { name: "Sign up" });
    fireEvent.change(screen.getByLabelText("Email address", { exact: false }), {
      target: { value: "person@example.com" },
    });
    fireEvent.change(document.querySelector<HTMLInputElement>('input[name="password"]')!, {
      target: { value: "StrongPassword1!" },
    });
    fireEvent.change(document.querySelector<HTMLInputElement>('input[name="passwordConfirmation"]')!, {
      target: { value: "StrongPassword1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign up" }));
    if (confirmationRequired) {
      await screen.findByRole("heading", { name: "Verify your email" });
      cleanup();
      const router = renderFlow("/confirmEmail?userId=user&code=code");
      fireEvent.click(await screen.findByRole("link", { name: "Sign in" }));
      await screen.findByRole("heading", { name: "Sign in" });
      expect(new URLSearchParams(router.state.location.search).get("returnUrl")).toBe(destination);
      fireEvent.click(screen.getByRole("button", { name: "Sign in with a passkey" }));
    }
    await waitFor(() => expect(screen.getByText("Task detail")).toBeTruthy());
  },
);

test("does not create a return destination after manual sign-out", async () => {
  runInAction(() => {
    stores.userAccountStore.currentUser = {
      isEmailConfirmed: true,
    } as NonNullable<typeof stores.userAccountStore.currentUser>;
  });
  const router = renderFlow();
  await screen.findByText("Task detail");

  await act(async () => {
    runInAction(() => {
      stores.userAccountStore.currentUser = null;
      stores.userAccountStore.isManualSignOut = true;
    });
  });

  await screen.findByRole("heading", { name: "Sign in" });
  expect(router.state.location.search).toBe("");
});

test.each([false, true])("waits for MFA before opening the original task (recovery=%s)", async (recovery) => {
  const { loginUser } = await import("@/features/identity/api/authApi");
  vi.mocked(stores.userAccountStore.signIn).mockResolvedValue({
    requiresTwoFactor: true,
  });
  vi.mocked(stores.userAccountStore.signInWithCachedToken).mockImplementation(authenticate);
  const router = renderFlow();
  fireEvent.change(await screen.findByLabelText("Email address", { exact: false }), {
    target: { value: "person@example.com" },
  });
  fireEvent.change(document.querySelector<HTMLInputElement>('input[name="password"]')!, {
    target: { value: "StrongPassword1!" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  await screen.findByLabelText("Verification code");
  if (recovery) fireEvent.click(screen.getByRole("button", { name: "Use a recovery code" }));
  const code = screen.getByLabelText(recovery ? "Recovery code" : "Verification code");
  expect(router.state.location.pathname).toBe("/signIn");
  expect(stores.userAccountStore.currentUser).toBeNull();
  expect(screen.queryByText("Task detail")).toBeNull();
  fireEvent.change(code, { target: { value: "012345" } });
  fireEvent.click(screen.getByRole("button", { name: "Verify code" }));
  await screen.findByText("Task detail");
  expect(loginUser).toHaveBeenCalledWith(
    expect.objectContaining({ email: "person@example.com", password: "StrongPassword1!" }),
    recovery ? { twoFactorRecoveryCode: "012345" } : { twoFactorCode: "012345" },
  );
  expect(`${router.state.location.pathname}${router.state.location.search}${router.state.location.hash}`).toBe(
    destination,
  );
});

test.each([true, false])(
  "password reset shows confirmation only on success (%s) without signing in",
  async (success) => {
    vi.mocked(stores.userAccountStore.resetPassword).mockResolvedValue(success);
    vi.mocked(stores.userAccountStore.signIn).mockClear();
    vi.mocked(stores.userAccountStore.signInWithCachedToken).mockClear();
    const toast = vi.spyOn(notification, "success");
    const router = renderFlow(
      `/resetPassword?email=person%40example.com&code=reset-code&returnUrl=${encodeURIComponent(destination)}`,
    );
    for (const name of ["password", "passwordConfirmation"]) {
      fireEvent.change(document.querySelector<HTMLInputElement>(`input[name="${name}"]`)!, {
        target: { value: "StrongPassword1!" },
      });
    }
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    await waitFor(() =>
      expect(stores.userAccountStore.resetPassword).toHaveBeenCalledWith(
        "person@example.com",
        "reset-code",
        "StrongPassword1!",
      ),
    );
    if (success) {
      await screen.findByRole("heading", { name: "Password reset" });
      expect(router.state.location.pathname).toBe("/passwordResetComplete");
      expect(screen.getByText(/Your password has been reset/)).toBeTruthy();
      expect(toast).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("link", { name: "Sign in" }));
      await screen.findByRole("heading", { name: "Sign in" });
      expect(new URLSearchParams(router.state.location.search).get("returnUrl")).toBe(destination);
    } else {
      expect(router.state.location.pathname).toBe("/resetPassword");
      expect(toast).not.toHaveBeenCalled();
    }
    expect(stores.userAccountStore.signIn).not.toHaveBeenCalled();
    expect(stores.userAccountStore.signInWithCachedToken).not.toHaveBeenCalled();
    expect(stores.userAccountStore.currentUser).toBeNull();
    toast.mockRestore();
  },
);

test.each([destination, "/confirmationEmailSent", "/passwordResetEmailSent"])(
  "signs out an unconfirmed session at %s with an explanation",
  async (entry) => {
    runInAction(() => {
      stores.userAccountStore.currentUser = {
        email: "person@example.com",
        isEmailConfirmed: false,
      } as NonNullable<typeof stores.userAccountStore.currentUser>;
    });
    (stores.applicationConfigurationStore as unknown as { requiresConfirmedEmail: boolean }).requiresConfirmedEmail =
      true;
    const toast = vi.spyOn(notification, "error");
    vi.mocked(stores.userAccountStore.signOut).mockClear();
    const router = renderFlow(entry);
    await screen.findByRole("heading", { name: "Sign in" });
    expect(stores.userAccountStore.currentUser).toBeNull();
    expect(stores.userAccountStore.signOut).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith(
      "You’ve been signed out because your email address must be verified. Verify your email before signing in again.",
    );
    expect(router.state.location.search).toBe("");
    expect(localStorage.getItem("authenticationReturnUrl")).toBeNull();
    expect(screen.queryByRole("button", { name: "Resend verification email" })).toBeNull();
    toast.mockRestore();
  },
);

test.each([
  ["/resendConfirmationEmail", "Send email confirmation link", "/confirmationEmailSent", "Verify your email"],
  ["/forgotPassword", "Send password reset link", "/passwordResetEmailSent", "Password reset"],
])("preserves the destination through %s and a fresh result-page load", async (entry, button, result, title) => {
  vi.mocked(stores.userAccountStore.resendConfirmationEmail).mockResolvedValue(true);
  vi.mocked(stores.userAccountStore.sendResetPasswordLink).mockResolvedValue(true);
  const router = renderFlow(`${entry}?returnUrl=${encodeURIComponent(destination)}`);
  fireEvent.change(screen.getByLabelText("Email address", { exact: false }), {
    target: { value: "person@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: button }));
  await screen.findByRole("heading", { name: title });
  expect(router.state.location.pathname).toBe(result);
  expect(new URLSearchParams(router.state.location.search).get("returnUrl")).toBe(destination);
  const resultUrl = `${router.state.location.pathname}${router.state.location.search}`;
  cleanup();
  localStorage.clear();
  const reloaded = renderFlow(resultUrl);
  expect(screen.getByRole("heading", { name: title })).toBeTruthy();
  fireEvent.click(screen.getByRole("link", { name: "Sign in" }));
  await screen.findByRole("heading", { name: "Sign in" });
  expect(new URLSearchParams(reloaded.state.location.search).get("returnUrl")).toBe(destination);
});
