import { Dictionary } from "@/shared/models/dictionary";
import { makeAutoObservable, runInAction } from "mobx";

export class CommonStore {
  actionLoadingCounter: Dictionary<number>;
  approvalRequestSubmitDialogIsOpen: boolean;
  approvalRequestTrackDialogIsOpen: boolean;
  approvalRequestViewDialogIsOpen: boolean;
  approvalRequestDeleteDialogIsOpen: boolean;
  taskViewDialogIsOpen: boolean;
  mainMenuDrawerIsOpen: boolean;
  profileDrawerIsOpen: boolean;
  tenantCreateDialogIsOpen: boolean;

  constructor(
    approvalRequestSubmitDialogIsOpen: boolean = false,
    approvalRequestTrackDialogIsOpen: boolean = false,
    approvalRequestViewDialogIsOpen: boolean = false,
    approvalRequestDeleteDialogIsOpen: boolean = false,
    taskViewDialogIsOpen: boolean = false,
    mainMenuDrawerIsOpen: boolean = false,
    profileDrawerIsOpen: boolean = false,
    tenantCreateDialogIsOpen: boolean = false,
    actionLoadingCounter: Dictionary<number> = {},
  ) {
    this.actionLoadingCounter = actionLoadingCounter;
    this.approvalRequestSubmitDialogIsOpen = approvalRequestSubmitDialogIsOpen;
    this.approvalRequestTrackDialogIsOpen = approvalRequestTrackDialogIsOpen;
    this.approvalRequestViewDialogIsOpen = approvalRequestViewDialogIsOpen;
    this.approvalRequestDeleteDialogIsOpen = approvalRequestDeleteDialogIsOpen;
    this.taskViewDialogIsOpen = taskViewDialogIsOpen;
    this.mainMenuDrawerIsOpen = mainMenuDrawerIsOpen;
    this.profileDrawerIsOpen = profileDrawerIsOpen;
    this.tenantCreateDialogIsOpen = tenantCreateDialogIsOpen;
    makeAutoObservable(this);
  }

  updateActionLoadingCounter = (loader: string, delta: number): void => {
    runInAction(() => {
      this.updateCounter(this.actionLoadingCounter, loader, delta);
    });
  };

  isActionLoading = (loader: string): boolean => {
    return (this.actionLoadingCounter[loader] ?? 0) > 0;
  };

  setApprovalRequestSubmitDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.approvalRequestSubmitDialogIsOpen = isOpen;
    });
  };

  setApprovalRequestTrackDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.approvalRequestTrackDialogIsOpen = isOpen;
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

  setTaskViewDialogIsOpen = (isOpen: boolean) => {
    runInAction(() => {
      this.taskViewDialogIsOpen = isOpen;
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
      this.approvalRequestTrackDialogIsOpen = false;
      this.approvalRequestViewDialogIsOpen = false;
      this.approvalRequestDeleteDialogIsOpen = false;
      this.taskViewDialogIsOpen = false;
      this.mainMenuDrawerIsOpen = false;
      this.profileDrawerIsOpen = false;
      this.tenantCreateDialogIsOpen = false;
      this.actionLoadingCounter = {};
    });
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
