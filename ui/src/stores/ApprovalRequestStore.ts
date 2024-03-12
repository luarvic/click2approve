import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import { IApprovalRequest } from "../models/ApprovalRequest";
import { ApprovalRequestStatuses } from "../models/ApprovalRequestStatuses";
import { ApprovalRequestTypes } from "../models/ApprovalRequestTypes";
import {
  getNumberOfIncomingApprovalRequests,
  listIncomingApprovalRequests,
  listOutgoingApprovalRequests,
} from "../utils/ApiClient";

class ApprovalRequestStore {
  approvalRequestsRegistry: Map<string, IApprovalRequest>;
  numberOfInboxApprovalRequests: number;

  get approvalRequests(): IApprovalRequest[] {
    return Array.from(this.approvalRequestsRegistry.values()).sort(
      (a, b) => b.sentDate.getTime() - a.sentDate.getTime()
    );
  }

  constructor(
    approvalRequestsRegistry: Map<string, IApprovalRequest>,
    numberOfInboxApprovalRequests: number
  ) {
    this.approvalRequestsRegistry = approvalRequestsRegistry;
    this.numberOfInboxApprovalRequests = numberOfInboxApprovalRequests;
    makeAutoObservable(this);
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
}

export const approvalRequestStore = new ApprovalRequestStore(
  new Map<string, IApprovalRequest>(),
  0
);
