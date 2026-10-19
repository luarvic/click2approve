import {
  NotificationChannel,
  NotificationPreferenceType,
  notificationPreferenceTypeToNotificationTypes,
} from "@/shared/models/notifications";
import UserProfilePage from "@/shared/pages/UserProfilePage";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ update: vi.fn().mockResolvedValue(true) }));
vi.mock("@/app/rootStore", () => ({
  stores: {
    userProfileStore: {
      hasLoaded: true,
      profile: { firstName: "Alex", notificationPreferences: [] },
      update: mocks.update,
    },
    applicationConfigurationStore: {
      apiTokensAreEnabled: true,
      subscriptionsAreEnabled: true,
      receiptsAreEnabled: true,
    },
    tenantStore: { tenants: [] },
    commonStore: { updateActionLoadingCounter: vi.fn() },
  },
}));
vi.mock("@/shared/utils/persistenceNotifications", () => ({
  PersistenceSuccessMessages: {},
  showPersistenceSuccessNotification: vi.fn(),
}));
afterEach(cleanup);

describe("profile notification preferences", () => {
  it("toggles and saves a category when no preferences have been saved yet, leaving other channels enabled", async () => {
    render(
      <MemoryRouter>
        <UserProfilePage tab="notifications" />
      </MemoryRouter>,
    );
    const email = screen.getByRole("switch", { name: "Request notifications Email" }) as HTMLInputElement;
    const inApp = screen.getByRole("switch", { name: "Request notifications In-app" }) as HTMLInputElement;
    expect(email.checked).toBe(true);
    fireEvent.click(email);
    expect(email.checked).toBe(false);
    expect(inApp.checked).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          notificationPreferences: notificationPreferenceTypeToNotificationTypes[
            NotificationPreferenceType.Requests
          ].map((type) => ({
            type,
            channel: NotificationChannel.Email,
            isEnabled: false,
          })),
        }),
      ),
    );
    fireEvent.click(email);
    expect(email.checked).toBe(true);
  });
});
