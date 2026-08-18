import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { useDiscussionMessages } from "@/features/discussions/hooks/useDiscussionMessages";
import type { DiscussionMessage } from "@/features/discussions/models/discussionMessage";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const api = vi.hoisted(() => ({
  listRequestDiscussion: vi.fn(),
  listTaskDiscussion: vi.fn(),
  sendRequestDiscussion: vi.fn(),
  sendTaskDiscussion: vi.fn(),
}));

vi.mock("@/features/discussions/api/discussionsApi", () => api);

const createMessage = (globalId: string): DiscussionMessage => ({
  approvalRequestStepGlobalId: "step-1",
  body: globalId,
  createdAt: "2026-08-11T16:11:21.8860840Z",
  globalId,
  isDelegated: false,
  isOutgoing: true,
  sentByDisplayName: "Employee name",
  sentByType: AssigneeType.Employee,
});

describe("useDiscussionMessages", () => {
  test("keeps a sent message when an earlier refresh completes afterwards", async () => {
    let resolveRefresh: (messages: DiscussionMessage[]) => void = () => undefined;
    api.listRequestDiscussion.mockImplementation(
      () => new Promise<DiscussionMessage[]>((resolve) => (resolveRefresh = resolve)),
    );
    const sentMessage = createMessage("sent-message");
    api.sendRequestDiscussion.mockResolvedValue(sentMessage);

    const { result } = renderHook(() =>
      useDiscussionMessages({
        requestGlobalId: "request-1",
        tenantGlobalId: "tenant-1",
      }),
    );

    await act(async () => {
      await result.current.send("New message", []);
    });

    await waitFor(() => expect(result.current.messages).toEqual([sentMessage]));

    await act(async () => {
      resolveRefresh([createMessage("stale-message")]);
    });

    expect(result.current.messages).toEqual([sentMessage]);
  });
});
