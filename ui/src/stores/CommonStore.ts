import { makeAutoObservable, runInAction } from "mobx";

export enum Tab {
  Files,
  Inbox,
  Archive,
  Sent,
}

class CommonStore {
  private currentTab: Tab;
  private sendDialogOpen: boolean;

  constructor(currentTab: Tab = Tab.Files, sendDialogOpen: boolean = false) {
    this.currentTab = currentTab;
    this.sendDialogOpen = sendDialogOpen;
    makeAutoObservable(this);
  }

  setCurrentTab = (tab: Tab): void => {
    runInAction(() => {
      this.currentTab = tab;
    });
  };

  getCurrentTab = (): Tab => this.currentTab;

  setSendDialogOpen = (open: boolean) => {
    runInAction(() => {
      this.sendDialogOpen = open;
    });
  };

  getSendDialogOpen = (): boolean => this.sendDialogOpen;
}

export const commonStore = new CommonStore();
