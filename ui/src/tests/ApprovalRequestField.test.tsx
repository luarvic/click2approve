import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import ApprovalRequestFieldGroup from "@/features/approvalRequests/components/ApprovalRequestFieldGroup";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("<ApprovalRequestField />", () => {
  test("uses the field group's value typography", () => {
    render(
      <>
        <ApprovalRequestFieldGroup title="Details">
          <ApprovalRequestField label="Status" value="Started" />
        </ApprovalRequestFieldGroup>
        <ApprovalRequestFieldGroup title="Activity" valueVariant="body2">
          <ApprovalRequestField label="Completed by" />
        </ApprovalRequestFieldGroup>
      </>,
    );

    expect(screen.getByText("Started").className).toContain("MuiTypography-body1");
    expect(screen.getByText("None").className).toContain("MuiTypography-body2");
  });
});
