import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("<ApprovalRequestParticipantLine />", () => {
  test("greys out its icon when disabled", () => {
    render(<ApprovalRequestParticipantLine disabled displayName="Ada Lovelace" type={AssigneeType.Employee} />);

    expect(screen.getByTestId("PersonIcon").className).toContain("MuiSvgIcon-colorDisabled");
  });
});
