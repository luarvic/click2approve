import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import ReceiptCard from "@/features/receipts/components/ReceiptCard";
import { ReceiptParticipantRole, type Receipt } from "@/features/receipts/models/receipt";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

const receipt: Receipt = {
  approvalRequestCreatedAt: new Date("2026-08-20T12:00:00Z"),
  approvalRequestGlobalId: "request-id",
  approvalRequestStatus: ApprovalRequestStatus.Completed,
  approvalRequestTitle: "Request title",
  createdAt: new Date("2026-08-20T12:30:00Z"),
  createdByDisplayName: "Requester",
  createdByEmail: "requester@example.com",
  files: [],
  globalId: "receipt-id",
  links: [],
  organizationDisplayName: "Request organization",
  participants: [],
  revisionNumber: 1,
  tenantDisplayName: "Tenant",
  tenantGlobalId: "tenant-id",
};

const createAssignee = (isAssigneeEmployee: boolean, organizationDisplayName: string) => ({
  action: "Approve",
  displayName: "Assignee",
  email: "assignee@example.com",
  files: [],
  isAssigneeEmployee,
  organizationDisplayName,
  role: ReceiptParticipantRole.Assignee,
  taskStatus: ApprovalRequestTaskStatus.Completed,
});

describe("<ReceiptCard />", () => {
  test("shows the organization for an employee assignee", () => {
    render(
      <ReceiptCard
        receipt={{
          ...receipt,
          participants: [createAssignee(true, "Employee organization")],
        }}
      />,
    );

    expect(screen.getByText("Employee organization")).toBeTruthy();
  });

  test("does not show the organization for a user assignee", () => {
    render(
      <ReceiptCard
        receipt={{
          ...receipt,
          participants: [createAssignee(false, "User organization")],
        }}
      />,
    );

    expect(screen.queryByText("User organization")).toBeNull();
  });
});
