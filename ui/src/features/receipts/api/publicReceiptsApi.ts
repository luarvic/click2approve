import type { PublicReceipt } from "@/features/receipts/models/publicReceipt";
import { normalizePublicReceiptDates } from "@/features/receipts/utils/receiptDateNormalizers";
import axios from "@/shared/api/axios";
import { getApiErrorNotification, isResourceNotFoundOrForbiddenError } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const getPublicReceipt = async (globalId: string): Promise<PublicReceipt | null> => {
  try {
    const { data } = await axios.get<PublicReceipt>(`api/v1/sharedVerificationLinks/${globalId}`);
    return normalizePublicReceiptDates(data);
  } catch (e) {
    if (isResourceNotFoundOrForbiddenError(e)) {
      return null;
    }
    notification.error(getApiErrorNotification(e));
    return null;
  }
};
