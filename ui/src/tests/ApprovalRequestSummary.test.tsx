import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("<ApprovalRequestSummary />", () => {
  test("shows the request number when request and task IDs are both available", () => {
    render(
      <ApprovalRequestSummary
        approvalRequestGlobalId="request-id"
        approvalRequestTaskGlobalId="visible-task-id"
        requestFiles={[]}
        title="Request title"
      />,
    );

    expect(screen.getByText("#reque")).toBeTruthy();
    expect(screen.queryByText("#visib")).toBeNull();
  });
});
