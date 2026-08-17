import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";

export const getApprovalRequestTaskActionLabels = (action?: ApprovalRequestTaskAction) => {
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
    case ApprovalRequestTaskAction.Review:
      return {
        positive: "Review",
        negative: "Request changes",
        missing: "Choose whether to review or request changes.",
      };
    case ApprovalRequestTaskAction.Verify:
      return {
        positive: "Verify",
        negative: "Fail verification",
        missing: "Choose whether to verify or fail verification.",
      };
    case ApprovalRequestTaskAction.Accept:
      return {
        positive: "Accept",
        negative: "Decline",
        missing: "Choose whether to accept or decline.",
      };
    case ApprovalRequestTaskAction.Complete:
      return {
        positive: "Complete",
        negative: "Cannot complete",
        missing: "Choose whether to complete or indicate that you cannot complete the task.",
      };
    default:
      return {
        positive: "Approve",
        negative: "Reject",
        missing: "Choose whether to approve or reject.",
      };
  }
};

export const getApprovalRequestTaskCompletedActionLabel = (action: ApprovalRequestTaskAction, result?: boolean) => {
  if (result === false) {
    switch (action) {
      case ApprovalRequestTaskAction.Sign:
        return "Declined";
      case ApprovalRequestTaskAction.Acknowledge:
        return "Disputed";
      case ApprovalRequestTaskAction.Review:
        return "Changes requested";
      case ApprovalRequestTaskAction.Verify:
        return "Verification failed";
      case ApprovalRequestTaskAction.Accept:
        return "Declined";
      case ApprovalRequestTaskAction.Complete:
        return "Could not complete";
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
    case ApprovalRequestTaskAction.Review:
      return "Reviewed";
    case ApprovalRequestTaskAction.Verify:
      return "Verified";
    case ApprovalRequestTaskAction.Accept:
      return "Accepted";
    case ApprovalRequestTaskAction.Complete:
      return "Completed";
    default:
      return "Approved";
  }
};
