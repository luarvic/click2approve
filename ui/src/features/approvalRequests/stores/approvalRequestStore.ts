import * as approvalRequestApi from "@/features/approvalRequests/api/approvalRequestsApi";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import { makeAutoObservable, runInAction } from "mobx";

export class ApprovalRequestStore {
  registry: Map<string, ApprovalRequestListItem>;
  details: Map<string, ApprovalRequest>;
  currentApprovalRequest: ApprovalRequest | null;
  requestToClone: ApprovalRequest | null;
  private detailRequests = new Map<string, Promise<ApprovalRequest | null>>();
  private listRequest: Promise<void> | null = null;
  private requestVersion = 0;

  constructor(
    registry: Map<string, ApprovalRequestListItem> = new Map(),
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
    return Array.from(this.registry.values()).sort(
      (a, b) => Date.parse(b.createdAt.toString()) - Date.parse(a.createdAt.toString()),
    );
  }

  getDetail = (globalId: string): ApprovalRequest | null => this.details.get(globalId) ?? null;

  cancel = async (tenantGlobalId: string, globalId: string): Promise<boolean> => {
    const isCanceled = await approvalRequestApi.cancelApprovalRequest(tenantGlobalId, globalId);
    if (!isCanceled) {
      return false;
    }

    await this.loadDetails(tenantGlobalId, globalId);
    return true;
  };

  delete = async (tenantGlobalId: string, globalId: string): Promise<boolean> => {
    if (!(await approvalRequestApi.deleteApprovalRequest(tenantGlobalId, globalId))) {
      return false;
    }

    runInAction(() => {
      this.registry.delete(globalId);
      this.details.delete(globalId);
      if (this.currentApprovalRequest?.globalId === globalId) this.currentApprovalRequest = null;
      if (this.requestToClone?.globalId === globalId) this.requestToClone = null;
    });
    return true;
  };

  load = (tenantGlobalId: string): Promise<void> => {
    if (this.listRequest) {
      return this.listRequest;
    }

    const requestVersion = ++this.requestVersion;
    const request = approvalRequestApi
      .listApprovalRequests(tenantGlobalId)
      .then((approvalRequests) => {
        if (requestVersion !== this.requestVersion) {
          return;
        }

        runInAction(() => {
          this.registry = new Map(
            approvalRequests.map((approvalRequest) => [approvalRequest.globalId, approvalRequest]),
          );
        });
      })
      .finally(() => {
        this.listRequest = null;
      });
    this.listRequest = request;
    return request;
  };

  loadDetails = (tenantGlobalId: string, globalId: string): Promise<ApprovalRequest | null> => {
    const inFlight = this.detailRequests.get(globalId);
    if (inFlight) {
      return inFlight;
    }

    const request = approvalRequestApi
      .getApprovalRequest(tenantGlobalId, globalId)
      .then((approvalRequest) => {
        if (approvalRequest) {
          runInAction(() => {
            this.details.set(approvalRequest.globalId, approvalRequest);
            this.registry.set(approvalRequest.globalId, approvalRequest);
            if (this.currentApprovalRequest?.globalId === approvalRequest.globalId) {
              this.currentApprovalRequest = approvalRequest;
            }
            if (this.requestToClone?.globalId === approvalRequest.globalId) {
              this.requestToClone = approvalRequest;
            }
          });
        }
        return approvalRequest;
      })
      .finally(() => {
        this.detailRequests.delete(globalId);
      });

    this.detailRequests.set(globalId, request);
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
