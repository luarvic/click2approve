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
          <ApprovalRequestField label="Completed by" value="Alex Morgan" />
        </ApprovalRequestFieldGroup>
      </>,
    );

    expect(screen.getByText("Started").className).toContain("MuiTypography-body1");
    expect(screen.getByText("Alex Morgan").className).toContain("MuiTypography-body2");
  });

  test("hides missing and blank fields while preserving zero values", () => {
    render(
      <>
        <ApprovalRequestField label="Description" />
        <ApprovalRequestField label="Instructions" value="   " />
        <ApprovalRequestField label="Completed at" value={null} />
        <ApprovalRequestField label="Attachments" value={0} />
      </>,
    );

    expect(screen.queryByText("Description")).toBeNull();
    expect(screen.queryByText("Instructions")).toBeNull();
    expect(screen.queryByText("Completed at")).toBeNull();
    expect(screen.getByText("Attachments")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
  });
});
