import * as approvalRequestApi from "@/features/approvalRequests/api/approvalRequestApi";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { makeAutoObservable, runInAction } from "mobx";

export class ApprovalRequestStore {
  registry: Map<number, ApprovalRequest>;
  currentApprovalRequest: ApprovalRequest | null;
  requestToClone: ApprovalRequest | null;
  // Incremented to invalidate older async requests so only the latest response updates the store.
  private requestVersion = 0;

  constructor(
    registry: Map<number, ApprovalRequest> = new Map<
      number,
      ApprovalRequest
    >(),
    currentApprovalRequest: ApprovalRequest | null = null,
    requestToClone: ApprovalRequest | null = null
  ) {
    this.registry = registry;
    this.currentApprovalRequest = currentApprovalRequest;
    this.requestToClone = requestToClone;
    makeAutoObservable(this);
  }

  get approvalRequests(): ApprovalRequest[] {
    return Array.from(this.registry.values()).sort((a, b) => b.id - a.id);
  }

  load = async () => {
    const requestVersion = ++this.requestVersion;
    const approvalRequests = await approvalRequestApi.listApprovalRequests();
    // Ignore this response if a newer load or clear operation has invalidated it.
    if (requestVersion !== this.requestVersion) {
      return;
    }

    approvalRequests.forEach(normalizeApprovalRequestDates);
    const registry = new Map(
      approvalRequests.map((approvalRequest) => [approvalRequest.id, approvalRequest]),
    );
    runInAction(() => {
      this.registry = registry;
      this.currentApprovalRequest = this.currentApprovalRequest
        ? registry.get(this.currentApprovalRequest.id) ?? null
        : null;
      this.requestToClone = this.requestToClone
        ? registry.get(this.requestToClone.id) ?? null
        : null;
    });
  };

  clear = () => {
    runInAction(() => {
      this.requestVersion += 1;
      this.registry = new Map();
    });
  };

  reset = () => {
    this.clear();
    runInAction(() => {
      this.currentApprovalRequest = null;
      this.requestToClone = null;
    });
  };

  setCurrent = (approvalRequest: ApprovalRequest | null) => {
    runInAction(() => {
      this.currentApprovalRequest = approvalRequest;
    });
  };

  setRequestToClone = (approvalRequest: ApprovalRequest | null) => {
    runInAction(() => {
      this.requestToClone = approvalRequest;
    });
  };
}

export const normalizeApprovalRequestDates = (
  approvalRequest: ApprovalRequest
) => {
  approvalRequest.createdAtDate = new Date(approvalRequest.createdAt + "Z");
  if (approvalRequest.completedAt) {
    approvalRequest.completedAtDate = new Date(approvalRequest.completedAt + "Z");
  }
  approvalRequest.tasks?.forEach(normalizeTaskDate);
  approvalRequest.steps?.forEach((step) => {
    step.tasks?.forEach(normalizeTaskDate);
  });
};

const normalizeTaskDate = (
  task:
    | {
      createdAt?: string;
      createdAtDate?: Date;
      completedAt?: string;
      completedAtDate?: Date;
    }
    | null
    | undefined
) => {
  if (!task) {
    return;
  }

  if (task.createdAt) {
    task.createdAtDate = new Date(task.createdAt + "Z");
  }
  if (task.completedAt) {
    task.completedAtDate = new Date(task.completedAt + "Z");
  }
};
