import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import DiscussionParticipants from "@/features/discussions/components/DiscussionParticipants";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("<DiscussionParticipants />", () => {
  test("shows requester and assignee entries when they share an email address", () => {
    render(
      <DiscussionParticipants
        assignees={[
          {
            email: "requester@example.com",
            type: AssigneeType.User,
          },
        ]}
        requesterDisplayName="Requester"
        requesterEmail="requester@example.com"
      />,
    );

    expect(screen.getByText("Requester")).toBeTruthy();
    expect(screen.getByText("requester@example.com")).toBeTruthy();
  });

  test("deduplicates participants with the same display name", () => {
    render(
      <DiscussionParticipants
        assignees={[
          {
            displayName: "Taylor Jones, Director",
            email: "taylor@example.com",
            type: AssigneeType.Employee,
          },
        ]}
        requesterDisplayName="Taylor Jones, Director"
        requesterEmail="taylor@example.com"
      />,
    );

    expect(screen.getAllByText("Taylor Jones, Director")).toHaveLength(1);
  });
});
