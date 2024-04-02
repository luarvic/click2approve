import { makeAutoObservable, runInAction } from "mobx";
import { IApprovalRequest } from "../models/approvalRequest";
import { approvalRequestList } from "../utils/apiClient";

export class ApprovalRequestStore {
  registry: Map<number, IApprovalRequest>;
  currentApprovalRequest: IApprovalRequest | null;

  constructor(
    registry: Map<number, IApprovalRequest> = new Map<
      number,
      IApprovalRequest
    >(),
    currentApprovalRequest: IApprovalRequest | null = null
  ) {
    this.registry = registry;
    this.currentApprovalRequest = currentApprovalRequest;
    makeAutoObservable(this);
  }

  get approvalRequests(): IApprovalRequest[] {
    return Array.from(this.registry.values()).sort((a, b) => b.id - a.id);
  }

  loadApprovalRequests = async () => {
    const approvalRequests = await approvalRequestList();
    approvalRequests.forEach((approvalRequest) => {
      approvalRequest.submittedDate = new Date(approvalRequest.submitted + "Z");
      if (approvalRequest.approveBy) {
        approvalRequest.approveByDate = new Date(
          approvalRequest.approveBy + "Z"
        );
      }
      approvalRequest.tasks.forEach((task) => {
        if (task.completed) {
          task.completedDate = new Date(task.completed + "Z");
        }
      });
      runInAction(() => {
        this.registry.set(approvalRequest.id, approvalRequest);
      });
    });
  };

  clearApprovalRequests = () => {
    runInAction(() => {
      this.registry.clear();
    });
  };

  setCurrentApprovalRequest = (approvalRequest: IApprovalRequest | null) => {
    runInAction(() => {
      this.currentApprovalRequest = approvalRequest;
    });
  };
}
