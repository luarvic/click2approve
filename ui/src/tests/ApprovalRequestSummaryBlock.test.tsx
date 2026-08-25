import ApprovalRequestSummaryBlock from "@/features/approvalRequests/components/ApprovalRequestSummaryBlock";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

const approvalRequest: ApprovalRequest = {
  createdAt: "2026-08-11T12:00:00Z",
  createdAtDate: new Date("2026-08-11T12:00:00Z"),
  createdByDisplayName: "Requester",
  createdByEmail: "requester@example.com",
  createdByUserGlobalId: "2a570304-5896-43b8-ab23-ff4db0c9efee",
  description: "Request description",
  globalId: "request-id",
  organizationDisplayName: "Personal",
  requestFiles: [],
  revisionNumber: 1,
  status: ApprovalRequestStatus.Pending,
  steps: [],
  title: "Request title",
};

describe("<ApprovalRequestSummaryBlock />", () => {
  test("can be collapsed by default and expanded", async () => {
    const user = userEvent.setup();

    render(<ApprovalRequestSummaryBlock approvalRequest={approvalRequest} defaultExpanded={false} expandable />);

    expect(screen.getByText("Request #reque")).toBeTruthy();
    expect(screen.queryByText("Request description")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Expand Request #reque" }));

    expect(screen.getByText("Request description")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Collapse Request #reque" })).toBeTruthy();
  });

  test("shows only the request number and participant status in a task workflow", () => {
    render(
      <ApprovalRequestSummaryBlock
        approvalRequest={approvalRequest}
        approvalRequestTaskGlobalId="visible-task-id"
        limitWorkflowFields
      />,
    );

    expect(screen.getByText("Request #reque")).toBeTruthy();
    expect(screen.queryByText("Request title")).toBeNull();
    expect(screen.queryByText("Request description")).toBeNull();
    expect(screen.queryByText("Revision 1")).toBeNull();
  });

  test("shows an email icon for a public user requester", () => {
    render(<ApprovalRequestSummaryBlock approvalRequest={approvalRequest} />);

    expect(screen.getByTestId("EmailIcon")).toBeTruthy();
    expect(screen.getByText("Request description")).toBeTruthy();
    expect(screen.queryByTestId("PersonIcon")).toBeNull();
  });

  test("shows a play icon for a started request", () => {
    render(
      <ApprovalRequestSummaryBlock
        approvalRequest={{
          ...approvalRequest,
          status: ApprovalRequestStatus.Started,
        }}
      />,
    );

    expect(screen.getByTestId("PlayCircleOutlineIcon")).toBeTruthy();
    expect(screen.queryByTestId("HourglassTopIcon")).toBeNull();
  });

  test("shows a person icon for an employee requester", () => {
    render(
      <ApprovalRequestSummaryBlock
        approvalRequest={{
          ...approvalRequest,
          createdByEmployeeGlobalId: "ae932e27-9916-4e24-a10a-cc46826a8bc5",
        }}
      />,
    );

    expect(screen.getByTestId("PersonIcon")).toBeTruthy();
    expect(screen.queryByTestId("EmailIcon")).toBeNull();
  });

  test("shows a person icon for an employee completer", () => {
    render(
      <ApprovalRequestSummaryBlock
        approvalRequest={{
          ...approvalRequest,
          completedAt: "2026-08-11T12:30:00Z",
          completedAtDate: new Date("2026-08-11T12:30:00Z"),
          completedByDisplayName: "Completer",
          completedByEmail: "completer@example.com",
          completedByUserGlobalId: "da13845f-7495-45d5-acb3-f6d9b2e47e4c",
          completedByEmployeeGlobalId: "2985cd78-c1ca-4a59-b7e7-799397a40c2a",
          result: true,
          status: ApprovalRequestStatus.Completed,
        }}
      />,
    );

    expect(screen.getByTestId("PersonIcon")).toBeTruthy();
    expect(screen.getByTestId("EmailIcon")).toBeTruthy();
  });
});
