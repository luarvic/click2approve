import * as approvalRequestTaskApi from "@/features/approvalRequests/api/approvalRequestTaskApi";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { normalizeApprovalRequestDates } from "@/features/approvalRequests/stores/approvalRequestStore";
import { makeAutoObservable, runInAction } from "mobx";

export class ApprovalRequestTaskStore {
  registry: Map<number, ApprovalRequestTask>;
  currentTask: ApprovalRequestTask | null;
  numberOfUncompletedTasks: number;

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
    const tasks = await approvalRequestTaskApi.listUncompletedApprovalRequestTasks();
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
      runInAction(() => {
        this.registry.set(task.id, task);
      });
    });
  };

  loadUncompletedCount = async () => {
    const numberOfUncompletedTasks = await approvalRequestTaskApi.countUncompletedApprovalRequestTasks();
    runInAction(() => {
      this.numberOfUncompletedTasks = numberOfUncompletedTasks;
    });
  };

  clear = () => {
    runInAction(() => {
      this.registry.clear();
    });
  };

  setCurrent = (task: ApprovalRequestTask | null) => {
    runInAction(() => {
      this.currentTask = task;
    });
  };
}
