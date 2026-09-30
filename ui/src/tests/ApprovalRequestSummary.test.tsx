import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import { ApprovalRequestDetailsCardModeContext } from "@/features/approvalRequests/components/ApprovalRequestDetailsCardContext";
import {
  ApprovalRequestFile,
  ApprovalRequestFileRevisionAction,
} from "@/features/approvalRequests/models/approvalRequest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

describe("<ApprovalRequestSummary />", () => {
  test("shows only current revision files until changes are requested", async () => {
    const makeFile = (
      name: string,
      revisionAction: ApprovalRequestFileRevisionAction,
      sequence: number,
    ): ApprovalRequestFile => ({
      globalId: name,
      revisionAction,
      sequence,
      userFile: {
        checked: false,
        createdAt: "2026-01-01T00:00:00Z",
        createdAtDate: new Date("2026-01-01T00:00:00Z"),
        globalId: name,
        name,
        size: 1,
        type: "application/pdf",
      },
    });

    render(
      <ApprovalRequestSummary
        requestFiles={[
          makeFile("old.pdf", ApprovalRequestFileRevisionAction.Removed, 0),
          makeFile("new.pdf", ApprovalRequestFileRevisionAction.Replaced, 1),
          makeFile("added.pdf", ApprovalRequestFileRevisionAction.Added, 2),
        ]}
        revisionNumber={2}
      />,
    );

    const toggle = screen.getByRole("switch", { name: "Show revision changes" });
    expect((toggle as HTMLInputElement).checked).toBe(false);
    expect(screen.getByText("new.pdf")).toBeTruthy();
    expect(screen.getByText("added.pdf")).toBeTruthy();
    expect(screen.queryByText("old.pdf")).toBeNull();
    expect(screen.queryByText("Replaced")).toBeNull();
    expect(screen.queryByText("Added")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Show help" }));
    expect(
      screen.getByText(
        "Replaced and deleted files are shown for context only. They are not part of the files you are reviewing.",
      ),
    ).toBeTruthy();
    await userEvent.keyboard("{Escape}");

    await userEvent.click(toggle);

    expect(screen.getByText("old.pdf")).toBeTruthy();
    expect(screen.getByText("Replaced")).toBeTruthy();
    expect(within(screen.getByText("old.pdf").parentElement!).getByText("Replaced")).toBeTruthy();
    expect(within(screen.getByText("new.pdf").parentElement!).queryByText("Replaced")).toBeNull();
    expect(screen.getByText("Added")).toBeTruthy();

    await userEvent.click(toggle);
    expect(screen.queryByText("old.pdf")).toBeNull();
  });

  test("shows an empty current revision when every file was removed", async () => {
    render(
      <ApprovalRequestSummary
        requestFiles={[
          {
            globalId: "removed-file",
            revisionAction: ApprovalRequestFileRevisionAction.Removed,
            sequence: 0,
            userFile: {
              checked: false,
              createdAt: "2026-01-01T00:00:00Z",
              createdAtDate: new Date("2026-01-01T00:00:00Z"),
              globalId: "removed-file",
              name: "removed.pdf",
              size: 1,
              type: "application/pdf",
            },
          },
        ]}
        revisionNumber={2}
      />,
    );

    expect(within(screen.getByText("Files to review").parentElement!).getByText("None")).toBeTruthy();
    expect(screen.queryByText("removed.pdf")).toBeNull();

    await userEvent.click(screen.getByRole("switch", { name: "Show revision changes" }));
    expect(screen.getByText("removed.pdf")).toBeTruthy();
    expect(screen.getByText("Deleted")).toBeTruthy();
  });

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

  test("does not label initial revision files as added", () => {
    render(
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
        revisionNumber={1}
      />,
    );

    expect(screen.queryByText("Added")).toBeNull();
  });

  test("keeps regular task detail fields visible by default", () => {
    render(
      <ApprovalRequestSummary
        description="Task description"
        instructions="Task instructions"
        requestFiles={[]}
        revisionNumber={2}
        showInstructions
        statusLabel="Pending"
      />,
    );

    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.getByText("Description")).toBeTruthy();
    expect(screen.getByText("Instructions")).toBeTruthy();
    expect(screen.getByText("Revision")).toBeTruthy();
    expect(screen.getByText("Files to review")).toBeTruthy();
  });
});
