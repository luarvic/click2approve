import { makeAutoObservable, runInAction } from "mobx";
import { Dictionary } from "../models/dictionary";
import { Tab } from "../models/tab";

export class CommonStore {
  currentTab?: Tab;
  loadingCounter: Dictionary<number>;
  approvalRequestSubmitDialogIsOpen: boolean;
  approvalRequestViewDialogIsOpen: boolean;
  approvalRequestDeleteDialogIsOpen: boolean;
  taskReviewDialogIsOpen: boolean;
  userFileDeleteDialogIsOpen: boolean;

  constructor(
    currentTab?: Tab,
    loadingCounter: Dictionary<number> = {},
    approvalRequestSubmitDialogIsOpen: boolean = false,
    approvalRequestViewDialogIsOpen: boolean = false,
    approvalRequestDeleteDialogIsOpen: boolean = false,
    taskReviewDialogIsOpen: boolean = false,
    userFileDeleteDialogIsOpen: boolean = false
  ) {
    this.currentTab = currentTab;
    this.loadingCounter = loadingCounter;
    this.approvalRequestSubmitDialogIsOpen = approvalRequestSubmitDialogIsOpen;
    this.approvalRequestViewDialogIsOpen = approvalRequestViewDialogIsOpen;
    this.approvalRequestDeleteDialogIsOpen = approvalRequestDeleteDialogIsOpen;
    this.taskReviewDialogIsOpen = taskReviewDialogIsOpen;
    this.userFileDeleteDialogIsOpen = userFileDeleteDialogIsOpen;
    makeAutoObservable(this);
  }

  updateLoadingCounter = (loader: string, delta: number): void => {
    runInAction(() => {
      try {
        this.loadingCounter[loader] = this.loadingCounter[loader] ?? 0;
        this.loadingCounter[loader] += delta;
      } catch {}
    });
  };

  isLoading = (loader: string): boolean => {
    this.loadingCounter;
    return (
      !isNaN(this.loadingCounter[loader]) && this.loadingCounter[loader] > 0
    );
  };

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

  setUserFileDeleteDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.userFileDeleteDialogIsOpen = isOpen;
    });
  };
}
