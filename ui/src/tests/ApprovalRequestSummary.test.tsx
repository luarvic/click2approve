import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import { ApprovalRequestDetailsCardModeContext } from "@/features/approvalRequests/components/ApprovalRequestDetailsCardContext";
import { ApprovalRequestFileRevisionAction } from "@/features/approvalRequests/models/approvalRequest";
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

  test("hides file state indicators when explicitly disabled", () => {
    render(
      <ApprovalRequestDetailsCardModeContext.Provider value="edit">
        <ApprovalRequestSummary
          requestFiles={[
            {
              globalId: "request-file-id",
              revisionAction: ApprovalRequestFileRevisionAction.Added,
              sequence: 0,
              userFile: {
                checked: false,
                createdAt: "2026-01-01T00:00:00Z",
                createdAtDate: new Date("2026-01-01T00:00:00Z"),
                globalId: "file-id",
                name: "request.pdf",
                size: 1,
                type: "application/pdf",
              },
            },
          ]}
          showFileStateIndicators={false}
        />
      </ApprovalRequestDetailsCardModeContext.Provider>,
    );

    expect(screen.queryByText("Added")).toBeNull();
  });
});
