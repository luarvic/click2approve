import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("<ApprovalRequestParticipant />", () => {
  test("shows the organization below an employee", () => {
    render(
      <ApprovalRequestParticipant
        displayName="Requester"
        email="requester@example.com"
        organizationDisplayName="Acme Corporation"
        showOrganization
        type={AssigneeType.Employee}
      />,
    );

    expect(screen.getByText("Requester")).toBeTruthy();
    expect(screen.getByText("Acme Corporation")).toBeTruthy();
    expect(screen.getByTestId("BusinessIcon")).toBeTruthy();
  });

  test("does not show the organization for non-employee participants", () => {
    render(
      <ApprovalRequestParticipant
        displayName="requester@example.com"
        organizationDisplayName="Acme Corporation"
        showOrganization
        type={AssigneeType.User}
      />,
    );

    expect(screen.getByText("requester@example.com")).toBeTruthy();
    expect(screen.queryByText("Acme Corporation")).toBeNull();
  });

  test("shows a system icon without an organization for system participants", () => {
    render(
      <ApprovalRequestParticipant
        displayName="System"
        isSystemParticipant
        organizationDisplayName="Acme Corporation"
        showOrganization
      />,
    );

    expect(screen.getByTestId("TerminalIcon")).toBeTruthy();
    expect(screen.queryByText("Acme Corporation")).toBeNull();
  });
});
