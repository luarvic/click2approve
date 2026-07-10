import { Dictionary } from "@/shared/models/dictionary";
import { makeAutoObservable, runInAction } from "mobx";

export class CommonStore {
  loadingCounter: Dictionary<number>;
  loadingPrefixCounter: Dictionary<number>;
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
    tenantCreateDialogIsOpen: boolean = false,
    loadingPrefixCounter: Dictionary<number> = {},
  ) {
    this.loadingCounter = loadingCounter;
    this.loadingPrefixCounter = loadingPrefixCounter;
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
      this.updateCounter(this.loadingCounter, loader, delta);
      this.getLoaderPrefixes(loader).forEach((prefix) =>
        this.updateCounter(this.loadingPrefixCounter, prefix, delta),
      );
    });
  };

  isLoading = (loader: string): boolean => {
    return (this.loadingCounter[loader] ?? 0) > 0;
  };

  isLoadingByPrefix = (loaderPrefix: string): boolean => {
    return (this.loadingPrefixCounter[loaderPrefix] ?? 0) > 0;
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

  clearSessionState = (): void => {
    runInAction(() => {
      this.approvalRequestSubmitDialogIsOpen = false;
      this.approvalRequestStepsDialogIsOpen = false;
      this.approvalRequestViewDialogIsOpen = false;
      this.approvalRequestDeleteDialogIsOpen = false;
      this.taskReviewDialogIsOpen = false;
      this.mainMenuDrawerIsOpen = false;
      this.profileDrawerIsOpen = false;
      this.tenantCreateDialogIsOpen = false;
    });
  };

  private getLoaderPrefixes = (loader: string): string[] => {
    const prefixes: string[] = [];
    for (
      let index = loader.indexOf("/");
      index >= 0;
      index = loader.indexOf("/", index + 1)
    ) {
      prefixes.push(loader.substring(0, index + 1));
    }
    return prefixes;
  };

  private updateCounter = (
    counters: Dictionary<number>,
    key: string,
    delta: number,
  ): void => {
    const nextCounter = (counters[key] ?? 0) + delta;
    if (nextCounter > 0) {
      counters[key] = nextCounter;
      return;
    }

    delete counters[key];
  };
}
