import { makeAutoObservable, runInAction } from "mobx";
import { Tab } from "../models/tab";

export class CommonStore {
  currentTab?: Tab;
  approvalRequestSubmitDialogIsOpen: boolean;
  approvalRequestViewDialogIsOpen: boolean;
  approvalRequestDeleteDialogIsOpen: boolean;
  taskReviewDialogIsOpen: boolean;

  constructor(
    currentTab?: Tab,
    approvalRequestSubmitDialogIsOpen: boolean = false,
    approvalRequestViewDialogIsOpen: boolean = false,
    approvalRequestDeleteDialogIsOpen: boolean = false,
    taskReviewDialogIsOpen: boolean = false
  ) {
    this.currentTab = currentTab;
    this.approvalRequestSubmitDialogIsOpen = approvalRequestSubmitDialogIsOpen;
    this.approvalRequestViewDialogIsOpen = approvalRequestViewDialogIsOpen;
    this.approvalRequestDeleteDialogIsOpen = approvalRequestDeleteDialogIsOpen;
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

  setApprovalRequestViewDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.approvalRequestViewDialogIsOpen = isOpen;
    });
  };

  setApprovalRequestDeleteDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.approvalRequestDeleteDialogIsOpen = isOpen;
    });
  };

  setTaskReviewDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.taskReviewDialogIsOpen = isOpen;
    });
  };
}
