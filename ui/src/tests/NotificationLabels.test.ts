import { getNotificationLabel } from "@/features/notifications/models/notification";
import { NotificationType } from "@/shared/models/notifications";
import { describe, expect, test } from "vitest";

describe("notification outcome labels", () => {
  test.each([
    [
      NotificationType.ApprovalRequestStepCompleted,
      "A step in your request titled Failed contract succeeded.",
      "Step succeeded",
    ],
    [
      NotificationType.ApprovalRequestStepCompleted,
      "A step in your request titled Contract succeeded. failed.",
      "Step failed",
    ],
    [NotificationType.ApprovalRequestCompleted, "Your request titled Contract succeeded.", "Request succeeded"],
    [NotificationType.ApprovalRequestCompleted, "Your request titled Contract failed.", "Request failed"],
    [NotificationType.ApprovalRequestCompleted, "Your request titled Contract was canceled.", "Request update"],
    [NotificationType.ApprovalRequestTaskCompleted, "Your task was completed automatically.", "Task completed"],
    [NotificationType.ApprovalRequestTaskCreated, "Contract failed.", "New task"],
  ])("uses the recorded outcome for %s: %s", (type, summary, expected) => {
    expect(getNotificationLabel({ type, summary })).toBe(expected);
  });
});
