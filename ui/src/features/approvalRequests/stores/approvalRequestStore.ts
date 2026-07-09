import * as approvalRequestApi from "@/features/approvalRequests/api/approvalRequestApi";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { makeAutoObservable, runInAction } from "mobx";

export class ApprovalRequestStore {
  registry: Map<number, ApprovalRequest>;
  currentApprovalRequest: ApprovalRequest | null;
  requestToClone: ApprovalRequest | null;

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
    const approvalRequests = await approvalRequestApi.listApprovalRequests();
    approvalRequests.forEach((approvalRequest) => {
      normalizeApprovalRequestDates(approvalRequest);
      runInAction(() => {
        this.registry.set(approvalRequest.id, approvalRequest);
      });
    });
  };

  clear = () => {
    runInAction(() => {
      this.registry.clear();
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
  if (approvalRequest.approveBy) {
    approvalRequest.approveByDate = new Date(approvalRequest.approveBy + "Z");
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
