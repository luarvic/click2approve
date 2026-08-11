import { countUnreadNotifications } from "@/features/notifications/api/notificationsApi";
import { makeAutoObservable, runInAction } from "mobx";

export class NotificationStore {
  unreadCount: number;
  private unreadCountRequestVersion = 0;

  constructor(unreadCount: number = 0) {
    this.unreadCount = unreadCount;
    makeAutoObservable(this);
  }

  loadUnreadCount = async (tenantGlobalId: string): Promise<void> => {
    const requestVersion = ++this.unreadCountRequestVersion;
    const unreadCount = await countUnreadNotifications(tenantGlobalId);
    if (requestVersion !== this.unreadCountRequestVersion) {
      return;
    }
    runInAction(() => {
      this.unreadCount = unreadCount;
    });
  };

  reset = (): void => {
    runInAction(() => {
      this.unreadCountRequestVersion += 1;
      this.unreadCount = 0;
    });
  };
}
