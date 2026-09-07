import { stores } from "@/app/rootStore";
import ConfirmEmailPage from "@/features/identity/pages/ConfirmEmailPage";
import SignInPage from "@/features/identity/pages/SignInPage";
import SignUpPage from "@/features/identity/pages/SignUpPage";
import AnonymousRoute from "@/shared/components/routing/AnonymousRoute";
import RouteGuard from "@/shared/components/routing/RouteGuard";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { runInAction } from "mobx";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("@/app/rootStore", async () => {
  const { observable } = await import("mobx");
  return {
    stores: {
      userAccountStore: observable(
        {
          currentUser: null,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signInWithPasskey: vi.fn(),
        },
        { signIn: false, signUp: false, signInWithPasskey: false },
      ),
      applicationConfigurationStore: { requiresConfirmedEmail: false },
    },
  };
});
vi.mock("@/features/identity/api/passkeysApi", () => ({ browserSupportsPasskeys: () => true }));
vi.mock("@/features/identity/api/authApi", () => ({ confirmUserEmail: vi.fn().mockResolvedValue(true) }));

const destination =
  "/tenants/f08eb8f4-4a49-484a-af9d-ca7bd918ea07/tasks/90de3e09-ea64-4f93-bf7a-4b9a4f49ab0d?view=full#details";

const renderFlow = (initialEntry = destination) => {
  const router = createMemoryRouter(
    [
      {
        element: <RouteGuard />,
        children: [{ path: "/tenants/:tenantGlobalId/tasks/:taskGlobalId", element: <p>Task detail</p> }],
      },
      {
        element: <AnonymousRoute />,
        children: [
          { path: "/signIn", element: <SignInPage /> },
          { path: "/signUp", element: <SignUpPage /> },
        ],
      },
      { path: "/confirmEmail", element: <ConfirmEmailPage /> },
      { path: "/information", element: <p>Check email</p> },
      { path: "/", element: <p>Home</p> },
    ],
    { initialEntries: [initialEntry] },
  );
  render(<RouterProvider router={router} />);
  return router;
};

const authenticate = async () => {
  runInAction(() => {
    stores.userAccountStore.currentUser = { isEmailConfirmed: true } as NonNullable<
      typeof stores.userAccountStore.currentUser
    >;
  });
  return true;
};

beforeEach(() => {
  localStorage.clear();
  runInAction(() => {
    stores.userAccountStore.currentUser = null;
  });
  (stores.applicationConfigurationStore as unknown as { requiresConfirmedEmail: boolean }).requiresConfirmedEmail =
    false;
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
});

test.each([false, true])(
  "preserves the task through sign-up with confirmation required=%s",
  async (confirmationRequired) => {
    (stores.applicationConfigurationStore as unknown as { requiresConfirmedEmail: boolean }).requiresConfirmedEmail =
      confirmationRequired;
    renderFlow();
    fireEvent.click(await screen.findByRole("button", { name: "New to us? Sign up" }));
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
      await screen.findByText("Check email");
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
