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

  constructor(
    currentTab?: Tab,
    loadingCounter: Dictionary<number> = { grid: 0, common: 0 },
    approvalRequestSubmitDialogIsOpen: boolean = false,
    approvalRequestViewDialogIsOpen: boolean = false,
    approvalRequestDeleteDialogIsOpen: boolean = false,
    taskReviewDialogIsOpen: boolean = false
  ) {
    this.currentTab = currentTab;
    this.loadingCounter = loadingCounter;
    this.approvalRequestSubmitDialogIsOpen = approvalRequestSubmitDialogIsOpen;
    this.approvalRequestViewDialogIsOpen = approvalRequestViewDialogIsOpen;
    this.approvalRequestDeleteDialogIsOpen = approvalRequestDeleteDialogIsOpen;
    this.taskReviewDialogIsOpen = taskReviewDialogIsOpen;
    makeAutoObservable(this);
  }

  updateLoadingCounter = (loader: string, delta: number): void => {
    runInAction(() => {
      this.loadingCounter[loader] += delta;
    });
  };

  isLoading = (loader: string): boolean => {
    return this.loadingCounter[loader] > 0;
  };

  updateLoadingCounterBasedOnUrl = (url: string, delta: number) => {
    switch (url) {
      case "api/task/countUncompleted":
        break;
      case "api/file/list":
      case "api/request/list":
      case "api/task/listUncompleted":
      case "api/task/listCompleted":
        this.updateLoadingCounter("grid", delta);
        break;
      default:
        this.updateLoadingCounter("common", delta);
        break;
    }
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
}
