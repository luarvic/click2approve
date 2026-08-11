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
            displayName: "Requester",
            email: "requester@example.com",
            type: AssigneeType.Email,
          },
        ]}
        requesterDisplayName="Requester"
        requesterEmail="requester@example.com"
      />,
    );

    expect(screen.getByText("Requester")).toBeTruthy();
    expect(screen.getByText("requester@example.com")).toBeTruthy();
  });
});
