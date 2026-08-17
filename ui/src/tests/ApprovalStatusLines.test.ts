import {
  getApprovalRequestStatusLineColor,
  getApprovalRequestTaskStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getStatusBorderSx } from "@/shared/components/status/StatusLines";
import { describe, expect, test } from "vitest";

describe("approval status line styles", () => {
  test("uses a dotted green border for started approval requests", () => {
    const sx = getStatusBorderSx(getApprovalRequestStatusLineColor(ApprovalRequestStatus.Started));

    expect(sx).toMatchObject({
      borderLeft: "3px dotted",
      borderLeftColor: "success.main",
    });
  });

  test("keeps successfully completed approval requests on a solid green border", () => {
    const sx = getStatusBorderSx(getApprovalRequestStatusLineColor(ApprovalRequestStatus.Completed, true));

    expect(sx).toMatchObject({
      borderLeft: "3px solid",
      borderLeftColor: "success.main",
    });
  });

  test.each([
    [ApprovalRequestTaskAction.Approve, true, "Approved"],
    [ApprovalRequestTaskAction.Sign, true, "Signed"],
    [ApprovalRequestTaskAction.Confirm, true, "Confirmed"],
    [ApprovalRequestTaskAction.Acknowledge, true, "Acknowledged"],
    [ApprovalRequestTaskAction.Review, true, "Reviewed"],
    [ApprovalRequestTaskAction.Verify, true, "Verified"],
    [ApprovalRequestTaskAction.Accept, true, "Accepted"],
    [ApprovalRequestTaskAction.Complete, true, "Completed"],
    [ApprovalRequestTaskAction.Approve, false, "Rejected"],
    [ApprovalRequestTaskAction.Sign, false, "Declined"],
    [ApprovalRequestTaskAction.Confirm, false, "Rejected"],
    [ApprovalRequestTaskAction.Acknowledge, false, "Disputed"],
    [ApprovalRequestTaskAction.Review, false, "Changes requested"],
    [ApprovalRequestTaskAction.Verify, false, "Verification failed"],
    [ApprovalRequestTaskAction.Accept, false, "Declined"],
    [ApprovalRequestTaskAction.Complete, false, "Could not complete"],
  ])("uses action-specific completed task label %#", (action, result, expectedLabel) => {
    expect(getApprovalRequestTaskStatusLabel(ApprovalRequestTaskStatus.Completed, action, result)).toBe(expectedLabel);
  });
});
