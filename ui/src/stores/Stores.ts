import { ApprovalRequestStore } from "./approvalRequestStore";
import { CommonStore } from "./commonStore";
import { FileStore } from "./fileStore";
import { TaskStore } from "./taskStore";
import { UserAccountStore } from "./userAccountStore";

export class Stores {
  commonStore: CommonStore;
  userAccountStore: UserAccountStore;
  fileStore: FileStore;
  approvalRequestStore: ApprovalRequestStore;
  taskStore: TaskStore;

  constructor(
    commonStore: CommonStore,
    userAccountStore: UserAccountStore,
    fileStore: FileStore,
    approvalRequestStore: ApprovalRequestStore,
    taskStore: TaskStore
  ) {
    this.commonStore = commonStore;
    this.userAccountStore = userAccountStore;
    this.fileStore = fileStore;
    this.approvalRequestStore = approvalRequestStore;
    this.taskStore = taskStore;
  }
}

export const stores = new Stores(
  new CommonStore(),
  new UserAccountStore(),
  new FileStore(),
  new ApprovalRequestStore(),
  new TaskStore()
);
