import type { PublicReceipt } from "@/features/receipts/models/publicReceipt";
import type { Receipt } from "@/features/receipts/models/receipt";
import { parseUtcDateTime } from "@/shared/utils/dateTime";

export const normalizeReceiptDates = (receipt: Receipt): Receipt => ({
  ...receipt,
  approvalRequestCompletedAt: receipt.approvalRequestCompletedAt
    ? parseUtcDateTime(receipt.approvalRequestCompletedAt as unknown as string)
    : undefined,
  approvalRequestCreatedAt: parseUtcDateTime(receipt.approvalRequestCreatedAt as unknown as string),
  createdAt: parseUtcDateTime(receipt.createdAt as unknown as string),
  links: receipt.links.map((link) => ({
    ...link,
    createdAt: parseUtcDateTime(link.createdAt as unknown as string),
  })),
  participants: receipt.participants.map((participant) => ({
    ...participant,
    assignedAt: participant.assignedAt ? parseUtcDateTime(participant.assignedAt as unknown as string) : undefined,
    completedAt: participant.completedAt ? parseUtcDateTime(participant.completedAt as unknown as string) : undefined,
  })),
});

export const normalizePublicReceiptDates = (receipt: PublicReceipt): PublicReceipt => ({
  ...receipt,
  approvalRequestApprovedAt: receipt.approvalRequestApprovedAt
    ? parseUtcDateTime(receipt.approvalRequestApprovedAt as unknown as string)
    : undefined,
  approvalRequestCreatedAt: parseUtcDateTime(receipt.approvalRequestCreatedAt as unknown as string),
  createdAt: parseUtcDateTime(receipt.createdAt as unknown as string),
  participants: receipt.participants.map((participant) => ({
    ...participant,
    assignedAt: participant.assignedAt ? parseUtcDateTime(participant.assignedAt as unknown as string) : undefined,
    completedAt: participant.completedAt ? parseUtcDateTime(participant.completedAt as unknown as string) : undefined,
  })),
});
