import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";

export const getApprovalRequestTaskActionLabels = (
  action?: ApprovalRequestTaskAction,
) => {
  switch (action) {
    case ApprovalRequestTaskAction.Sign:
      return {
        positive: "Sign",
        negative: "Decline",
        missing: "Choose whether to sign or decline.",
      };
    case ApprovalRequestTaskAction.Confirm:
      return {
        positive: "Confirm",
        negative: "Reject",
        missing: "Choose whether to confirm or reject.",
      };
    case ApprovalRequestTaskAction.Acknowledge:
      return {
        positive: "Acknowledge",
        negative: "Dispute",
        missing: "Choose whether to acknowledge or dispute.",
      };
    default:
      return {
        positive: "Approve",
        negative: "Reject",
        missing: "Choose whether to approve or reject.",
      };
  }
};

export const getApprovalRequestTaskCompletedActionLabel = (
  action: ApprovalRequestTaskAction,
  result?: boolean,
) => {
  if (result === false) {
    switch (action) {
      case ApprovalRequestTaskAction.Sign:
        return "Declined";
      case ApprovalRequestTaskAction.Acknowledge:
        return "Disputed";
      default:
        return "Rejected";
    }
  }

  switch (action) {
    case ApprovalRequestTaskAction.Sign:
      return "Signed";
    case ApprovalRequestTaskAction.Confirm:
      return "Confirmed";
    case ApprovalRequestTaskAction.Acknowledge:
      return "Acknowledged";
    default:
      return "Approved";
  }
};
