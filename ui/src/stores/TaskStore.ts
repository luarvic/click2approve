import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import { IApprovalRequestTask } from "../models/ApprovalRequestTask";
import { Tab } from "../models/Tab";
import {
  countUncompletedTasks,
  listCompletedTasks,
  listUncompletedTasks,
} from "../utils/ApiClient";

class TaskStore {
  registry: Map<number, IApprovalRequestTask>;
  currentTask: IApprovalRequestTask | null;
  numberOfUncompletedTasks: number;
  approvalRequestViewDialogIsOpen: boolean;

  constructor(
    registry: Map<number, IApprovalRequestTask> = new Map<
      number,
      IApprovalRequestTask
    >(),
    currentTask: IApprovalRequestTask | null = null,
    numberOfUncompletedTasks: number = 0,
    approvalRequestViewDialogIsOpen: boolean = false
  ) {
    this.registry = registry;
    this.currentTask = currentTask;
    this.numberOfUncompletedTasks = numberOfUncompletedTasks;
    this.numberOfUncompletedTasks = numberOfUncompletedTasks;
    this.approvalRequestViewDialogIsOpen = approvalRequestViewDialogIsOpen;
    makeAutoObservable(this);
  }

  get tasks(): IApprovalRequestTask[] {
    return Array.from(this.registry.values()).sort((a, b) => b.id - a.id);
  }

  loadTasks = async (tab: Tab) => {
    try {
      let tasks: IApprovalRequestTask[] = [];
      if (tab === Tab.Inbox) {
        tasks = await listUncompletedTasks();
      } else if (tab === Tab.Archive) {
        tasks = await listCompletedTasks();
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
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to load tasks.");
      }
    }
  };

  loadNumberOfUncompletedTasks = async () => {
    try {
      const numberOfUncompletedTasks = await countUncompletedTasks();
      runInAction(() => {
        this.numberOfUncompletedTasks = numberOfUncompletedTasks;
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to load number of uncompleted tasks.");
      }
    }
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

export const taskStore = new TaskStore();
