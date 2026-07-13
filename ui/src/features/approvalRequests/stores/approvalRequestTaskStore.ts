import * as approvalRequestTaskApi from "@/features/approvalRequests/api/approvalRequestTaskApi";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import { normalizeApprovalRequestDates } from "@/features/approvalRequests/stores/approvalRequestStore";
import { parseUtcDateTime } from "@/shared/utils/helpers";
import { makeAutoObservable, runInAction } from "mobx";

export class ApprovalRequestTaskStore {
  registry: Map<number, ApprovalRequestTaskListItem>;
  details: Map<number, ApprovalRequestTask>;
  currentTask: ApprovalRequestTask | null;
  numberOfUncompletedTasks: number;
  private detailRequests = new Map<number, Promise<ApprovalRequestTask | null>>();
  private listRequest: Promise<void> | null = null;
  private countRequestVersion = 0;
  private listRequestVersion = 0;

  constructor(
    registry: Map<number, ApprovalRequestTaskListItem> = new Map(),
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
    return Array.from(this.registry.values()).sort((a, b) => b.id - a.id);
  }

  getDetail = (id: number): ApprovalRequestTask | null => this.details.get(id) ?? null;

  loadIncoming = (): Promise<void> => {
    if (this.listRequest) {
      return this.listRequest;
    }

    const requestVersion = ++this.listRequestVersion;
    const request = approvalRequestTaskApi.listApprovalRequestTasks().then((tasks) => {
      if (requestVersion !== this.listRequestVersion) {
        return;
      }
      tasks.forEach(normalizeTaskDates);
      runInAction(() => {
        this.registry = new Map(tasks.map((task) => [task.id, task]));
      });
    }).finally(() => {
      this.listRequest = null;
    });
    this.listRequest = request;
    return request;
  };

  loadDetails = (id: number, refresh = false): Promise<ApprovalRequestTask | null> => {
    if (!refresh) {
      const detail = this.details.get(id);
      if (detail) {
        return Promise.resolve(detail);
      }
    }

    const inFlight = this.detailRequests.get(id);
    if (inFlight) {
      return inFlight;
    }

    const request = approvalRequestTaskApi.getApprovalRequestTask(id).then((task) => {
      if (task) {
        normalizeTaskDates(task);
        if (task.approvalRequest) {
          normalizeApprovalRequestDates(task.approvalRequest);
        }
        runInAction(() => {
          this.details.set(task.id, task);
          if (this.currentTask?.id === task.id) {
            this.currentTask = task;
          }
        });
      }
      return task;
    }).finally(() => {
      this.detailRequests.delete(id);
    });

    this.detailRequests.set(id, request);
    return request;
  };

  loadUncompletedCount = async (): Promise<void> => {
    const requestVersion = ++this.countRequestVersion;
    const numberOfUncompletedTasks = await approvalRequestTaskApi.countUncompletedApprovalRequestTasks();
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

const normalizeTaskDates = (
  task: Pick<ApprovalRequestTask, "createdAt" | "completedAt"> & {
    createdAtDate?: Date;
    completedAtDate?: Date;
  },
) => {
  task.createdAtDate = parseUtcDateTime(task.createdAt);
  if (task.completedAt) {
    task.completedAtDate = parseUtcDateTime(task.completedAt);
  }
};
