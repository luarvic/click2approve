import { makeAutoObservable, runInAction } from "mobx";
import {
  taskCountUncompleted,
  taskListCompleted,
  taskListUncompleted,
} from "../api/controllers/approvalRequestTask";
import { IApprovalRequestTask } from "../models/approvalRequestTask";
import { Tab } from "../models/tab";

export class ApprovalRequestTaskStore {
  registry: Map<number, IApprovalRequestTask>;
  currentTask: IApprovalRequestTask | null;
  numberOfUncompletedTasks: number;

  constructor(
    registry: Map<number, IApprovalRequestTask> = new Map<
      number,
      IApprovalRequestTask
    >(),
    currentTask: IApprovalRequestTask | null = null,
    numberOfUncompletedTasks: number = 0
  ) {
    this.registry = registry;
    this.currentTask = currentTask;
    this.numberOfUncompletedTasks = numberOfUncompletedTasks;
    this.numberOfUncompletedTasks = numberOfUncompletedTasks;
    makeAutoObservable(this);
  }

  get tasks(): IApprovalRequestTask[] {
    return Array.from(this.registry.values()).sort((a, b) => b.id - a.id);
  }

  loadTasks = async (tab: Tab) => {
    let tasks: IApprovalRequestTask[] = [];
    if (tab === Tab.Inbox) {
      tasks = await taskListUncompleted();
    } else if (tab === Tab.Archive) {
      tasks = await taskListCompleted();
    }
    tasks.forEach((task) => {
      task.approvalRequest.submittedDate = new Date(
        task.approvalRequest.submitted + "Z"
      );
      if (task.approvalRequest.approveBy) {
        task.approvalRequest.approveByDate = new Date(
          task.approvalRequest.approveBy + "Z"
        );
      }
      if (task.completed) {
        task.completedDate = new Date(task.completed + "Z");
      }
      runInAction(() => {
        this.registry.set(task.id, task);
      });
    });
  };

  loadNumberOfUncompletedTasks = async () => {
    const numberOfUncompletedTasks = await taskCountUncompleted();
    runInAction(() => {
      this.numberOfUncompletedTasks = numberOfUncompletedTasks;
    });
  };

  clearTasks = () => {
    runInAction(() => {
      this.registry.clear();
    });
  };

  setCurrentTask = (task: IApprovalRequestTask | null) => {
    runInAction(() => {
      this.currentTask = task;
    });
  };
}
