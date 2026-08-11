import type { DiscussionMessage } from "@/features/discussions/api/discussionsApi";
import { getDiscussionMessageSender } from "@/features/discussions/components/DiscussionPanel";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import { describe, expect, test } from "vitest";

const message: DiscussionMessage = {
  approvalRequestStepGlobalId: "f2828e32-2212-4d06-a2d7-f0603571b7b0",
  body: "Hello",
  createdAt: "2026-08-11T16:11:21.8860840Z",
  globalId: "19286f65-5201-4195-a08b-2fc1804234f5",
  isDelegated: false,
  isOutgoing: false,
  sentByDisplayName: "Employee name, Position",
  sentByType: AssigneeType.Employee,
};

describe("getDiscussionMessageSender", () => {
  test("uses the sender display name", () => {
    expect(getDiscussionMessageSender(message)).toBe("Employee name, Position");
  });
});
