import { normalizePublicReceiptDates, normalizeReceiptDates } from "@/features/receipts/utils/receiptDateNormalizers";
import { normalizeUserFileDates } from "@/features/userFiles/utils/userFileDateNormalizers";
import type { PublicReceipt } from "@/features/receipts/models/publicReceipt";
import type { Receipt } from "@/features/receipts/models/receipt";
import type { UserFile } from "@/features/userFiles/models/userFile";
import { describe, expect, test } from "vitest";

describe("response date normalizers", () => {
  test("normalizes receipt dates, including links and nested participants", () => {
    const receipt = {
      approvalRequestCreatedAt: "2026-07-13T14:30:00",
      approvalRequestCompletedAt: "2026-07-13T15:30:00Z",
      createdAt: "2026-07-13T16:30:00+02:00",
      links: [{ createdAt: "2026-07-13T17:30:00" }],
      participants: [{ assignedAt: "2026-07-13T18:30:00", completedAt: "2026-07-13T19:30:00Z" }],
    } as unknown as Receipt;

    const normalized = normalizeReceiptDates(receipt);

    expect(normalized.approvalRequestCreatedAt.toISOString()).toBe("2026-07-13T14:30:00.000Z");
    expect(normalized.approvalRequestCompletedAt?.toISOString()).toBe("2026-07-13T15:30:00.000Z");
    expect(normalized.createdAt.toISOString()).toBe("2026-07-13T14:30:00.000Z");
    expect(normalized.links[0].createdAt.toISOString()).toBe("2026-07-13T17:30:00.000Z");
    expect(normalized.participants[0].assignedAt?.toISOString()).toBe("2026-07-13T18:30:00.000Z");
    expect(normalized.participants[0].completedAt?.toISOString()).toBe("2026-07-13T19:30:00.000Z");
  });

  test("normalizes public receipts and user files without mutating API data", () => {
    const receipt = {
      approvalRequestCreatedAt: "2026-07-13T14:30:00",
      approvalRequestApprovedAt: "2026-07-13T15:30:00Z",
      createdAt: "2026-07-13T16:30:00+02:00",
      participants: [],
    } as unknown as PublicReceipt;
    const userFile = { createdAt: "2026-07-13T14:30:00" } as unknown as UserFile;

    const normalizedReceipt = normalizePublicReceiptDates(receipt);
    const normalizedUserFile = normalizeUserFileDates(userFile);

    expect(normalizedReceipt.createdAt.toISOString()).toBe("2026-07-13T14:30:00.000Z");
    expect(normalizedUserFile.createdAtDate.toISOString()).toBe("2026-07-13T14:30:00.000Z");
    expect(userFile.createdAtDate).toBeUndefined();
  });
});
