import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("<ApprovalRequestField />", () => {
  test("uses body2 typography for empty and populated values by default", () => {
    render(
      <>
        <ApprovalRequestField label="Completed by" />
        <ApprovalRequestField label="Completed at" value="August 26, 2026" />
      </>,
    );

    expect(screen.getByText("None").className).toContain("MuiTypography-body2");
    expect(screen.getByText("August 26, 2026").className).toContain("MuiTypography-body2");
  });
});
