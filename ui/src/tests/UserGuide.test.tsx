import { stores } from "@/app/rootStore";
import UserGuide from "@/shared/components/onboarding/UserGuide";
import { isUserGuideDismissed } from "@/shared/session/session";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { runInAction } from "mobx";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("@/app/rootStore", async () => {
  const { makeAutoObservable } = await import("mobx");
  const { CommonStore } = await import("@/shared/stores/commonStore");
  return {
    stores: {
      commonStore: new CommonStore(),
      userAccountStore: makeAutoObservable({ currentUser: { email: "" }, passkeyEnrollmentPending: false }),
      tenantStore: makeAutoObservable({ hasLoaded: true, tenants: [{}] }),
      applicationConfigurationStore: makeAutoObservable({ tenantsAreEnabled: true }),
    },
  };
});

let accountNumber = 0;
beforeEach(() => {
  localStorage.clear();
  runInAction(() => {
    stores.commonStore.clearSessionState();
    stores.userAccountStore.currentUser = { email: `guide-${++accountNumber}@example.com`, isEmailConfirmed: true };
    stores.userAccountStore.passkeyEnrollmentPending = false;
    stores.tenantStore.hasLoaded = true;
    Object.assign(stores.applicationConfigurationStore, { tenantsAreEnabled: true });
  });
});
afterEach(cleanup);

const Guide = () => (
  <>
    <button data-user-guide="profile">Open profile</button>
    <button data-user-guide="notifications">Open notifications</button>
    <div data-user-guide="workspace">Workspace</div>
    <button data-user-guide="menu-button">Open menu</button>
    <span data-user-guide-group="Work" />
    <span data-user-guide-group="Support" />
    <UserGuide appBarOptions={{}} />
  </>
);

const next = () => fireEvent.click(screen.getByRole("button", { name: "Next" }));

test("automatically walks through available controls, supports Back, and remembers completion", async () => {
  const view = render(<Guide />);
  await screen.findByRole("dialog", { name: "Your profile and settings" });
  expect(screen.getByText("Step 1 of 4")).toBeTruthy();
  next();
  expect(screen.getByRole("dialog", { name: "Stay up to date" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByRole("dialog", { name: "Your profile and settings" })).toBeTruthy();
  next();
  next();
  expect(screen.getByRole("dialog", { name: "Choose your workspace" })).toBeTruthy();
  next();
  expect(screen.getByRole("dialog", { name: "Find your way around" })).toBeTruthy();
  expect(screen.getByText("Work")).toBeTruthy();
  expect(screen.getByText("Support")).toBeTruthy();
  expect(screen.queryByText("People")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Finish" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  const email = stores.userAccountStore.currentUser!.email;
  expect(localStorage.getItem(`userGuideDismissed.v1.${encodeURIComponent(email)}`)).toBe("true");
  view.unmount();
  render(<Guide />);
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("Skip dismisses the guide, replay starts at the first step, and Escape dismisses it", async () => {
  const user = userEvent.setup();
  render(<Guide />);
  await screen.findByRole("dialog");
  next();
  fireEvent.click(screen.getByRole("button", { name: "Skip" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  act(() => stores.commonStore.setUserGuideIsOpen(true));
  await screen.findByRole("dialog", { name: "Your profile and settings" });
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(isUserGuideDismissed(stores.userAccountStore.currentUser!.email)).toBe(true);
});

test("waits for workspace initialization and passkey enrollment to finish", async () => {
  runInAction(() => {
    stores.tenantStore.hasLoaded = false;
    stores.userAccountStore.passkeyEnrollmentPending = true;
  });
  render(<Guide />);
  expect(screen.queryByRole("dialog")).toBeNull();
  act(() => {
    runInAction(() => {
      stores.tenantStore.hasLoaded = true;
    });
  });
  expect(screen.queryByRole("dialog")).toBeNull();
  act(() => {
    runInAction(() => {
      stores.userAccountStore.passkeyEnrollmentPending = false;
    });
  });
  await screen.findByRole("dialog", { name: "Your profile and settings" });
});

test("omits the workspace step when the picker is unavailable and isolates accounts", async () => {
  runInAction(() => {
    Object.assign(stores.applicationConfigurationStore, { tenantsAreEnabled: false });
  });
  render(<Guide />);
  await screen.findByRole("dialog");
  expect(screen.getByText("Step 1 of 3")).toBeTruthy();
  next();
  next();
  expect(screen.getByRole("dialog", { name: "Find your way around" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Finish" }));
  act(() => {
    runInAction(() => {
      stores.userAccountStore.currentUser = { email: "another@example.com", isEmailConfirmed: true };
    });
  });
  await screen.findByRole("dialog", { name: "Your profile and settings" });
});
