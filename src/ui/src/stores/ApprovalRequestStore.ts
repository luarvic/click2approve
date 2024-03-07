import { makeAutoObservable, runInAction } from "mobx";
import { toast } from "react-toastify";
import { IApprovalRequest } from "../models/ApprovalRequest";
import { ApprovalRequestStatuses } from "../models/ApprovalRequestStatuses";
import {
  listApprovalRequests,
  listSentApprovalRequests,
} from "../utils/ApiClient";
import { ApprovalRequestTypes } from "../models/ApprovalRequestTypes";

export class ApprovalRequestStore {
  approvalRequestsRegistry: Map<string, IApprovalRequest>;

  get approvalRequests(): IApprovalRequest[] {
    return Array.from(this.approvalRequestsRegistry.values()).sort(
      (a, b) => b.sentDate.getTime() - a.sentDate.getTime()
    );
  }

  constructor(approvalRequestsRegistry: Map<string, IApprovalRequest>) {
    this.approvalRequestsRegistry = approvalRequestsRegistry;
    makeAutoObservable(this);
  }

  loadApprovalRequests = async (type: ApprovalRequestTypes) => {
    try {
      let approvalRequests: IApprovalRequest[];
      if (type === ApprovalRequestTypes.Inbox) {
        approvalRequests = await listApprovalRequests([
          ApprovalRequestStatuses.Submitted,
        ]);
      } else if (type === ApprovalRequestTypes.Archive) {
        approvalRequests = await listApprovalRequests([
          ApprovalRequestStatuses.Approved,
          ApprovalRequestStatuses.Rejected,
        ]);
      } else {
        approvalRequests = await listSentApprovalRequests();
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
  new Map<string, IApprovalRequest>()
);
