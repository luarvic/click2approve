import {
  getApprovalRequestStatusLineColor,
  getApprovalStatusBorderSx,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { describe, expect, test } from "vitest";

describe("approval status line styles", () => {
  test("uses a dotted green border for started approval requests", () => {
    const sx = getApprovalStatusBorderSx(
      getApprovalRequestStatusLineColor(ApprovalRequestStatus.Started),
    );

    expect(sx).toMatchObject({
      borderLeft: "3px dotted",
      borderLeftColor: "success.main",
    });
  });

  test("keeps successfully completed approval requests on a solid green border", () => {
    const sx = getApprovalStatusBorderSx(
      getApprovalRequestStatusLineColor(ApprovalRequestStatus.Completed, true),
    );

    expect(sx).toMatchObject({
      borderLeft: "3px solid",
      borderLeftColor: "success.main",
    });
  });
});
