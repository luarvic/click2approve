import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import { IApprovalRequest } from "../models/ApprovalRequest";
import { ApprovalRequestStatuses } from "../models/ApprovalRequestStatuses";
import { ApprovalRequestTypes } from "../models/ApprovalRequestTypes";
import {
  getNumberOfIncomingApprovalRequests,
  handleApprovalRequest,
  listIncomingApprovalRequests,
  listOutgoingApprovalRequests,
} from "../utils/ApiClient";

class ApprovalRequestStore {
  approvalRequestsRegistry: Map<number, IApprovalRequest>;
  numberOfInboxApprovalRequests: number;
  currentApprovalRequest: IApprovalRequest | null;
  approvalRequestSubmitDialogIsOpen: boolean;
  approvalRequestReviewDialogIsOpen: boolean;

  constructor(
    approvalRequestsRegistry: Map<number, IApprovalRequest> = new Map<
      number,
      IApprovalRequest
    >(),
    numberOfInboxApprovalRequests: number = 0,
    currentApprovalRequest: IApprovalRequest | null = null,
    approvalRequestSubmitDialogIsOpen: boolean = false,
    approvalRequestReviewDialogIsOpen: boolean = false
  ) {
    this.approvalRequestsRegistry = approvalRequestsRegistry;
    this.numberOfInboxApprovalRequests = numberOfInboxApprovalRequests;
    this.currentApprovalRequest = currentApprovalRequest;
    this.approvalRequestSubmitDialogIsOpen = approvalRequestSubmitDialogIsOpen;
    this.approvalRequestReviewDialogIsOpen = approvalRequestReviewDialogIsOpen;
    makeAutoObservable(this);
  }

  get approvalRequests(): IApprovalRequest[] {
    return Array.from(this.approvalRequestsRegistry.values()).sort(
      (a, b) => b.sentDate.getTime() - a.sentDate.getTime()
    );
  }

  loadNumberOfInboxApprovalRequests = async () => {
    try {
      const numberOfInboxApprovalRequests =
        await getNumberOfIncomingApprovalRequests([
          ApprovalRequestStatuses.Submitted,
        ]);
      runInAction(() => {
        this.numberOfInboxApprovalRequests = numberOfInboxApprovalRequests;
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to load number of inbox approval requests.");
      }
    }
  };

  loadApprovalRequests = async (type: ApprovalRequestTypes) => {
    try {
      let approvalRequests: IApprovalRequest[];
      if (type === ApprovalRequestTypes.Inbox) {
        approvalRequests = await listIncomingApprovalRequests([
          ApprovalRequestStatuses.Submitted,
        ]);
      } else if (type === ApprovalRequestTypes.Archive) {
        approvalRequests = await listIncomingApprovalRequests([
          ApprovalRequestStatuses.Approved,
          ApprovalRequestStatuses.Rejected,
        ]);
      } else {
        approvalRequests = await listOutgoingApprovalRequests();
      }
      approvalRequests.forEach(async (approvalRequest) => {
        approvalRequest.sentDate = new Date(approvalRequest.sent + "Z");
        approvalRequest.approveByDate = new Date(
          approvalRequest.approveBy + "Z"
        );
        runInAction(() => {
          this.approvalRequestsRegistry.set(
            approvalRequest.id,
            approvalRequest
          );
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
      this.approvalRequestsRegistry.clear();
    });
  };

  setCurrentApprovalRequest = (approvalRequest: IApprovalRequest | null) => {
    runInAction(() => {
      this.currentApprovalRequest = approvalRequest;
    });
  };

  setApprovalRequestSubmitDialogIsOpen = (open: boolean) => {
    runInAction(() => {
      this.approvalRequestSubmitDialogIsOpen = open;
    });
  };

  setApprovalRequestReviewDialogIsOpen = (open: boolean) => {
    runInAction(() => {
      this.approvalRequestReviewDialogIsOpen = open;
    });
  };

  handleApprovalRequest = async (
    approvalRequest: IApprovalRequest,
    status: ApprovalRequestStatuses,
    comment: string
  ) => {
    try {
      await handleApprovalRequest(approvalRequest.id, status, comment);
    } catch (e) {
      if (e instanceof Error) {
        toast.warn(e.message);
      } else {
        toast.warn("Unable to handle approval requests.");
      }
    }
  };
}

export const approvalRequestStore = new ApprovalRequestStore();
