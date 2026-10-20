import { countUnreadNotifications } from "@/features/notifications/api/notificationsApi";
import { NotificationStore } from "@/features/notifications/stores/notificationStore";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/notifications/api/notificationsApi", () => ({ countUnreadNotifications: vi.fn() }));

describe("notification count polling", () => {
  beforeEach(() => vi.resetAllMocks());

  it("handles rejected background requests and resumes on the next refresh", async () => {
    const store = new NotificationStore(2);
    vi.mocked(countUnreadNotifications).mockRejectedValueOnce({ response: { status: 402 } });
    await expect(store.loadUnreadCount("suspended-workspace")).resolves.toBeUndefined();
    expect(store.unreadCount).toBe(2);
    vi.mocked(countUnreadNotifications).mockResolvedValueOnce(3);
    await store.loadUnreadCount("recovered-workspace");
    expect(store.unreadCount).toBe(3);
  });

  it("does not let a stale response restore the count after changing workspace", async () => {
    let finish!: (count: number) => void;
    vi.mocked(countUnreadNotifications).mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    const store = new NotificationStore(2);
    const pending = store.loadUnreadCount("previous-workspace");
    store.reset();
    finish(10);
    await pending;
    expect(store.unreadCount).toBe(0);
  });
});
