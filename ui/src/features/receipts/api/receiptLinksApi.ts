import type { PublicReceipt } from "@/features/receipts/models/publicReceipt";
import { normalizePublicReceiptDates } from "@/features/receipts/utils/receiptDateNormalizers";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification, isResourceNotFoundOrForbiddenError } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const getReceiptByLink = async (linkGlobalId: string): Promise<PublicReceipt | null> => {
  try {
    const { data } = await axios.get<PublicReceipt>(ApiPaths.receiptLinks.byId(linkGlobalId));
    return normalizePublicReceiptDates(data);
  } catch (e) {
    if (isResourceNotFoundOrForbiddenError(e)) {
      return null;
    }
    notification.error(getApiErrorNotification(e));
    return null;
  }
};
