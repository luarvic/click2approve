import { makeAutoObservable, runInAction } from "mobx";
import { Tab } from "../models/Tab";

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
