import * as approvalRequestTaskApi from "@/features/approvalRequests/api/approvalRequestTasksApi";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import { makeAutoObservable, runInAction } from "mobx";

export class ApprovalRequestTaskStore {
  registry: Map<string, ApprovalRequestTaskListItem>;
  details: Map<string, ApprovalRequestTask>;
  currentTask: ApprovalRequestTask | null;
  numberOfUncompletedTasks: number;
  private detailRequests = new Map<string, Promise<ApprovalRequestTask | null>>();
  private listRequest: Promise<void> | null = null;
  private countRequestVersion = 0;
  private listRequestVersion = 0;

  constructor(
    registry: Map<string, ApprovalRequestTaskListItem> = new Map(),
    currentTask: ApprovalRequestTask | null = null,
    numberOfUncompletedTasks: number = 0,
  ) {
    this.registry = registry;
    this.details = new Map();
    this.currentTask = currentTask;
    this.numberOfUncompletedTasks = numberOfUncompletedTasks;
    makeAutoObservable(this);
  }

  get tasks(): ApprovalRequestTaskListItem[] {
    return Array.from(this.registry.values()).sort(
      (a, b) => Date.parse(b.createdAt.toString()) - Date.parse(a.createdAt.toString()),
    );
  }

  getDetail = (globalId: string): ApprovalRequestTask | null => this.details.get(globalId) ?? null;

  loadIncoming = (tenantGlobalId: string): Promise<void> => {
    if (this.listRequest) {
      return this.listRequest;
    }

    const requestVersion = ++this.listRequestVersion;
    const request = approvalRequestTaskApi
      .listApprovalRequestTasks(tenantGlobalId)
      .then((tasks) => {
        if (requestVersion !== this.listRequestVersion) {
          return;
        }
        runInAction(() => {
          this.registry = new Map(tasks.map((task) => [task.globalId, task]));
        });
      })
      .finally(() => {
        this.listRequest = null;
      });
    this.listRequest = request;
    return request;
  };

  loadDetails = (tenantGlobalId: string, globalId: string): Promise<ApprovalRequestTask | null> => {
    const inFlight = this.detailRequests.get(globalId);
    if (inFlight) {
      return inFlight;
    }

    const request = approvalRequestTaskApi
      .getApprovalRequestTask(tenantGlobalId, globalId)
      .then((task) => {
        if (task) {
          runInAction(() => {
            this.details.set(task.globalId, task);
            if (this.currentTask?.globalId === task.globalId) {
              this.currentTask = task;
            }
          });
        }
        return task;
      })
      .finally(() => {
        this.detailRequests.delete(globalId);
      });

    this.detailRequests.set(globalId, request);
    return request;
  };

  loadUncompletedCount = async (tenantGlobalId: string): Promise<void> => {
    const requestVersion = ++this.countRequestVersion;
    const numberOfUncompletedTasks = await approvalRequestTaskApi.countUncompletedApprovalRequestTasks(tenantGlobalId);
    if (requestVersion !== this.countRequestVersion) {
      return;
    }
    runInAction(() => {
      this.numberOfUncompletedTasks = numberOfUncompletedTasks;
    });
  };

  clear = (): void => {
    runInAction(() => {
      this.listRequestVersion += 1;
      this.registry = new Map();
      this.details = new Map();
      this.detailRequests.clear();
      this.listRequest = null;
    });
  };

  reset = (): void => {
    this.clear();
    runInAction(() => {
      this.countRequestVersion += 1;
      this.currentTask = null;
      this.numberOfUncompletedTasks = 0;
    });
  };

  setCurrent = (task: ApprovalRequestTask | null): void => {
    runInAction(() => {
      this.currentTask = task;
    });
  };
}
