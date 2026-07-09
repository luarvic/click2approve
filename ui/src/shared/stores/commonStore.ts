import { Dictionary } from "@/shared/models/dictionary";
import { makeAutoObservable, runInAction } from "mobx";

export class CommonStore {
  loadingCounter: Dictionary<number>;
  approvalRequestSubmitDialogIsOpen: boolean;
  approvalRequestStepsDialogIsOpen: boolean;
  approvalRequestViewDialogIsOpen: boolean;
  approvalRequestDeleteDialogIsOpen: boolean;
  taskReviewDialogIsOpen: boolean;
  mainMenuDrawerIsOpen: boolean;
  profileDrawerIsOpen: boolean;
  tenantCreateDialogIsOpen: boolean;

  constructor(
    loadingCounter: Dictionary<number> = {},
    approvalRequestSubmitDialogIsOpen: boolean = false,
    approvalRequestStepsDialogIsOpen: boolean = false,
    approvalRequestViewDialogIsOpen: boolean = false,
    approvalRequestDeleteDialogIsOpen: boolean = false,
    taskReviewDialogIsOpen: boolean = false,
    mainMenuDrawerIsOpen: boolean = false,
    profileDrawerIsOpen: boolean = false,
    tenantCreateDialogIsOpen: boolean = false
  ) {
    this.loadingCounter = loadingCounter;
    this.approvalRequestSubmitDialogIsOpen = approvalRequestSubmitDialogIsOpen;
    this.approvalRequestStepsDialogIsOpen = approvalRequestStepsDialogIsOpen;
    this.approvalRequestViewDialogIsOpen = approvalRequestViewDialogIsOpen;
    this.approvalRequestDeleteDialogIsOpen = approvalRequestDeleteDialogIsOpen;
    this.taskReviewDialogIsOpen = taskReviewDialogIsOpen;
    this.mainMenuDrawerIsOpen = mainMenuDrawerIsOpen;
    this.profileDrawerIsOpen = profileDrawerIsOpen;
    this.tenantCreateDialogIsOpen = tenantCreateDialogIsOpen;
    makeAutoObservable(this);
  }

  updateLoadingCounter = (loader: string, delta: number): void => {
    runInAction(() => {
      this.loadingCounter[loader] = this.loadingCounter[loader] ?? 0;
      this.loadingCounter[loader] += delta;
    });
  };

  isLoading = (loader: string): boolean => {
    this.loadingCounter;
    return (
      !isNaN(this.loadingCounter[loader]) && this.loadingCounter[loader] > 0
    );
  };

  isLoadingByPrefix = (loaderPrefix: string): boolean => {
    this.loadingCounter;
    return Object.entries(this.loadingCounter).some(
      ([loader, counter]) => loader.startsWith(loaderPrefix) && counter > 0
    );
  };

  setApprovalRequestSubmitDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.approvalRequestSubmitDialogIsOpen = isOpen;
    });
  };

  setApprovalRequestStepsDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.approvalRequestStepsDialogIsOpen = isOpen;
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

  setMainMenuDrawerIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.mainMenuDrawerIsOpen = isOpen;
    });
  };

  setProfileDrawerIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.profileDrawerIsOpen = isOpen;
    });
  };

  setTenantCreateDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.tenantCreateDialogIsOpen = isOpen;
    });
  };
}
