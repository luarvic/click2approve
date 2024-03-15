import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import { IApprovalRequest } from "../models/ApprovalRequest";
import { listApprovalRequests } from "../utils/ApiClient";

class ApprovalRequestStore {
  registry: Map<number, IApprovalRequest>;
  currentApprovalRequest: IApprovalRequest | null;
  approvalRequestSubmitDialogIsOpen: boolean;
  approvalRequestReviewDialogIsOpen: boolean;

  constructor(
    registry: Map<number, IApprovalRequest> = new Map<
      number,
      IApprovalRequest
    >(),
    currentApprovalRequest: IApprovalRequest | null = null,
    approvalRequestSubmitDialogIsOpen: boolean = false,
    approvalRequestReviewDialogIsOpen: boolean = false
  ) {
    this.registry = registry;
    this.currentApprovalRequest = currentApprovalRequest;
    this.approvalRequestSubmitDialogIsOpen = approvalRequestSubmitDialogIsOpen;
    this.approvalRequestReviewDialogIsOpen = approvalRequestReviewDialogIsOpen;
    makeAutoObservable(this);
  }

  get approvalRequests(): IApprovalRequest[] {
    return Array.from(this.registry.values()).sort((a, b) => b.id - a.id);
  }

  loadApprovalRequests = async () => {
    try {
      const approvalRequests = await listApprovalRequests();
      approvalRequests.forEach((approvalRequest) => {
        approvalRequest.submittedDate = new Date(
          approvalRequest.submitted + "Z"
        );
        approvalRequest.approveByDate = new Date(
          approvalRequest.approveBy + "Z"
        );
        approvalRequest.logs.forEach((log) => {
          log.whenDate = new Date(log.when + "Z");
        });
        runInAction(() => {
          this.registry.set(approvalRequest.id, approvalRequest);
        });
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to load approval requests.");
      }
    }
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
