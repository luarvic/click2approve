import * as approvalRequestApi from "@/features/approvalRequests/api/approvalRequestApi";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import { parseUtcDateTime } from "@/shared/utils/helpers";
import { makeAutoObservable, runInAction } from "mobx";

export class ApprovalRequestStore {
  registry: Map<number, ApprovalRequestListItem>;
  details: Map<number, ApprovalRequest>;
  currentApprovalRequest: ApprovalRequest | null;
  requestToClone: ApprovalRequest | null;
  private detailRequests = new Map<number, Promise<ApprovalRequest | null>>();
  private listRequest: Promise<void> | null = null;
  private requestVersion = 0;

  constructor(
    registry: Map<number, ApprovalRequestListItem> = new Map(),
    currentApprovalRequest: ApprovalRequest | null = null,
    requestToClone: ApprovalRequest | null = null,
  ) {
    this.registry = registry;
    this.details = new Map();
    this.currentApprovalRequest = currentApprovalRequest;
    this.requestToClone = requestToClone;
    makeAutoObservable(this);
  }

  get approvalRequests(): ApprovalRequestListItem[] {
    return Array.from(this.registry.values()).sort((a, b) => b.id - a.id);
  }

  getDetail = (id: number): ApprovalRequest | null => this.details.get(id) ?? null;

  load = (): Promise<void> => {
    if (this.listRequest) {
      return this.listRequest;
    }

    const requestVersion = ++this.requestVersion;
    const request = approvalRequestApi.listApprovalRequests().then((approvalRequests) => {
      if (requestVersion !== this.requestVersion) {
        return;
      }

      approvalRequests.forEach(normalizeApprovalRequestDates);
      runInAction(() => {
        this.registry = new Map(
          approvalRequests.map((approvalRequest) => [approvalRequest.id, approvalRequest]),
        );
      });
    }).finally(() => {
      this.listRequest = null;
    });
    this.listRequest = request;
    return request;
  };

  loadDetails = (id: number): Promise<ApprovalRequest | null> => {
    const inFlight = this.detailRequests.get(id);
    if (inFlight) {
      return inFlight;
    }

    const request = approvalRequestApi.getApprovalRequest(id).then((approvalRequest) => {
      if (approvalRequest) {
        normalizeApprovalRequestDates(approvalRequest);
        runInAction(() => {
          this.details.set(approvalRequest.id, approvalRequest);
          if (this.currentApprovalRequest?.id === approvalRequest.id) {
            this.currentApprovalRequest = approvalRequest;
          }
          if (this.requestToClone?.id === approvalRequest.id) {
            this.requestToClone = approvalRequest;
          }
        });
      }
      return approvalRequest;
    }).finally(() => {
      this.detailRequests.delete(id);
    });

    this.detailRequests.set(id, request);
    return request;
  };

  clear = (): void => {
    runInAction(() => {
      this.requestVersion += 1;
      this.registry = new Map();
      this.details = new Map();
      this.detailRequests.clear();
      this.listRequest = null;
    });
  };

  reset = (): void => {
    this.clear();
    runInAction(() => {
      this.currentApprovalRequest = null;
      this.requestToClone = null;
    });
  };

  setCurrent = (approvalRequest: ApprovalRequest | null): void => {
    runInAction(() => {
      this.currentApprovalRequest = approvalRequest;
    });
  };

  setRequestToClone = (approvalRequest: ApprovalRequest | null): void => {
    runInAction(() => {
      this.requestToClone = approvalRequest;
    });
  };
}

export const normalizeApprovalRequestDates = (
  approvalRequest: Pick<ApprovalRequest, "createdAt" | "completedAt"> & {
    createdAtDate?: Date;
    completedAtDate?: Date;
    tasks?: ApprovalRequest["tasks"];
    steps?: ApprovalRequest["steps"];
  },
) => {
  approvalRequest.createdAtDate = parseUtcDateTime(approvalRequest.createdAt);
  if (approvalRequest.completedAt) {
    approvalRequest.completedAtDate = parseUtcDateTime(approvalRequest.completedAt);
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
    | undefined,
) => {
  if (!task) {
    return;
  }

  if (task.createdAt) {
    task.createdAtDate = parseUtcDateTime(task.createdAt);
  }
  if (task.completedAt) {
    task.completedAtDate = parseUtcDateTime(task.completedAt);
  }
};
