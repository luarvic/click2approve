import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("<ApprovalRequestSummary />", () => {
  test("does not show the request number beside the title", () => {
    render(
      <ApprovalRequestSummary
        approvalRequestGlobalId="request-id"
        approvalRequestTaskGlobalId="visible-task-id"
        requestFiles={[]}
        title="Request title"
      />,
    );

    expect(screen.queryByText("#reque")).toBeNull();
    expect(screen.queryByText("#visib")).toBeNull();
  });
});
