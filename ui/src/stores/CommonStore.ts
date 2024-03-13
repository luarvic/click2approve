import { makeAutoObservable, runInAction } from "mobx";

export enum Tab {
  Files,
  Inbox,
  Archive,
  Sent,
}

class CommonStore {
  currentTab: Tab;

  constructor(currentTab: Tab = Tab.Files) {
    this.currentTab = currentTab;
    makeAutoObservable(this);
  }

  setCurrentTab = (tab: Tab): void => {
    runInAction(() => {
      this.currentTab = tab;
    });
  };
}

export const commonStore = new CommonStore();
