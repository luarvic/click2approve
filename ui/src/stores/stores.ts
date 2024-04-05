import { ApprovalRequestStore } from "./approvalRequestStore";
import { CommonStore } from "./commonStore";
import { FileStore } from "./fileStore";
import { TaskStore } from "./taskStore";
import { UserAccountStore } from "./userAccountStore";
import { UserSettingsStore } from "./userSettingsStore";

class Stores {
  commonStore: CommonStore;
  userAccountStore: UserAccountStore;
  fileStore: FileStore;
  approvalRequestStore: ApprovalRequestStore;
  taskStore: TaskStore;
  userSettingsStore: UserSettingsStore;

  constructor(
    commonStore: CommonStore,
    userAccountStore: UserAccountStore,
    fileStore: FileStore,
    approvalRequestStore: ApprovalRequestStore,
    taskStore: TaskStore,
    userSettingsStore: UserSettingsStore
  ) {
    this.commonStore = commonStore;
    this.userAccountStore = userAccountStore;
    this.fileStore = fileStore;
    this.approvalRequestStore = approvalRequestStore;
    this.taskStore = taskStore;
    this.userSettingsStore = userSettingsStore;
  }
}

export const stores = new Stores(
  new CommonStore(),
  new UserAccountStore(),
  new FileStore(),
  new ApprovalRequestStore(),
  new TaskStore(),
  new UserSettingsStore()
);
