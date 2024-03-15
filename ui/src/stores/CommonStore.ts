import { makeAutoObservable, runInAction } from "mobx";
import { Tab } from "../models/Tab";

class CommonStore {
  currentTab: Tab;
  approvalRequestSubmitDialogIsOpen: boolean;
  approvalRequestReviewDialogIsOpen: boolean;
  taskReviewDialogIsOpen: boolean;

  constructor(
    currentTab: Tab = Tab.Files,
    approvalRequestSubmitDialogIsOpen: boolean = false,
    approvalRequestReviewDialogIsOpen: boolean = false,
    taskReviewDialogIsOpen: boolean = false
  ) {
    this.currentTab = currentTab;
    this.approvalRequestSubmitDialogIsOpen = approvalRequestSubmitDialogIsOpen;
    this.approvalRequestReviewDialogIsOpen = approvalRequestReviewDialogIsOpen;
    this.taskReviewDialogIsOpen = taskReviewDialogIsOpen;
    makeAutoObservable(this);
  }

  setCurrentTab = (tab: Tab): void => {
    runInAction(() => {
      this.currentTab = tab;
    });
  };

  setApprovalRequestSubmitDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.approvalRequestSubmitDialogIsOpen = isOpen;
    });
  };

  setApprovalRequestReviewDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.approvalRequestReviewDialogIsOpen = isOpen;
    });
  };

  setTaskReviewDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.approvalRequestReviewDialogIsOpen = isOpen;
    });
  };
}

export const commonStore = new CommonStore();
