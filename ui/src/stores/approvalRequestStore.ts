import { makeAutoObservable, runInAction } from "mobx";
import { IApprovalRequest } from "../models/approvalRequest";
import { listApprovalRequests } from "../utils/apiClient";

class ApprovalRequestStore {
  registry: Map<number, IApprovalRequest>;
  currentApprovalRequest: IApprovalRequest | null;
  approvalRequestSubmitDialogIsOpen: boolean;
  approvalRequestViewDialogIsOpen: boolean;

  constructor(
    registry: Map<number, IApprovalRequest> = new Map<
      number,
      IApprovalRequest
    >(),
    currentApprovalRequest: IApprovalRequest | null = null,
    approvalRequestSubmitDialogIsOpen: boolean = false,
    approvalRequestViewDialogIsOpen: boolean = false
  ) {
    this.registry = registry;
    this.currentApprovalRequest = currentApprovalRequest;
    this.approvalRequestSubmitDialogIsOpen = approvalRequestSubmitDialogIsOpen;
    this.approvalRequestViewDialogIsOpen = approvalRequestViewDialogIsOpen;
    makeAutoObservable(this);
  }

  get approvalRequests(): IApprovalRequest[] {
    return Array.from(this.registry.values()).sort((a, b) => b.id - a.id);
  }

  loadApprovalRequests = async () => {
    const approvalRequests = await listApprovalRequests();
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

export const approvalRequestStore = new ApprovalRequestStore();
