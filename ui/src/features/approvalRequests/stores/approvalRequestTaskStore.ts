import * as approvalRequestTaskApi from "@/features/approvalRequests/api/approvalRequestTaskApi";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { normalizeApprovalRequestDates } from "@/features/approvalRequests/stores/approvalRequestStore";
import { makeAutoObservable, runInAction } from "mobx";

export class ApprovalRequestTaskStore {
  registry: Map<number, ApprovalRequestTask>;
  currentTask: ApprovalRequestTask | null;
  numberOfUncompletedTasks: number;
  // Incremented to invalidate older count requests so only the latest response updates the store.
  private countRequestVersion = 0;
  // Incremented to invalidate older list requests so only the latest response updates the store.
  private listRequestVersion = 0;

  constructor(
    registry: Map<number, ApprovalRequestTask> = new Map<
      number,
      ApprovalRequestTask
    >(),
    currentTask: ApprovalRequestTask | null = null,
    numberOfUncompletedTasks: number = 0
  ) {
    this.registry = registry;
    this.currentTask = currentTask;
    this.numberOfUncompletedTasks = numberOfUncompletedTasks;
    makeAutoObservable(this);
  }

  get tasks(): ApprovalRequestTask[] {
    return Array.from(this.registry.values()).sort((a, b) => b.id - a.id);
  }

  loadIncoming = async (): Promise<ApprovalRequestTask[]> => {
    const requestVersion = ++this.listRequestVersion;
    const tasks = await approvalRequestTaskApi.listUncompletedApprovalRequestTasks();
    if (requestVersion !== this.listRequestVersion) {
      return [];
    }
    this.setTasks(tasks);
    return tasks;
  };

  private setTasks = (tasks: ApprovalRequestTask[]) => {
    tasks.forEach((task) => {
      normalizeApprovalRequestDates(task.approvalRequest);
      task.createdAtDate = new Date(task.createdAt + "Z");
      if (task.completedAt) {
        task.completedAtDate = new Date(task.completedAt + "Z");
      }
    });
    const registry = new Map(tasks.map((task) => [task.id, task]));
    runInAction(() => {
      this.registry = registry;
      this.currentTask = this.currentTask
        ? registry.get(this.currentTask.id) ?? null
        : null;
    });
  };

  loadUncompletedCount = async () => {
    const requestVersion = ++this.countRequestVersion;
    const numberOfUncompletedTasks = await approvalRequestTaskApi.countUncompletedApprovalRequestTasks();
    if (requestVersion !== this.countRequestVersion) {
      return;
    }
    runInAction(() => {
      this.numberOfUncompletedTasks = numberOfUncompletedTasks;
    });
  };

  clear = () => {
    runInAction(() => {
      this.listRequestVersion += 1;
      this.registry = new Map();
    });
  };

  reset = () => {
    this.clear();
    runInAction(() => {
      this.countRequestVersion += 1;
      this.currentTask = null;
      this.numberOfUncompletedTasks = 0;
    });
  };

  setCurrent = (task: ApprovalRequestTask | null) => {
    runInAction(() => {
      this.currentTask = task;
    });
  };
}
