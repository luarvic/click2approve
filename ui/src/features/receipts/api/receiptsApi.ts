import type { Receipt } from "@/features/receipts/models/receipt";
import { normalizeReceiptDates } from "@/features/receipts/utils/receiptDateNormalizers";
import axios from "@/shared/api/axios";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

const config = { useWorkEmployeeContext: true };

export const listReceipts = async (tenantGlobalId: string): Promise<Receipt[]> => {
  try {
    const { data } = await axios.get<Receipt[]>(`api/v1/tenants/${tenantGlobalId}/receipts`, config);
    return data.map(normalizeReceiptDates);
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return [];
  }
};

export const getReceipt = async (tenantGlobalId: string, receiptGlobalId: string): Promise<Receipt | null> => {
  try {
    const { data } = await axios.get<Receipt>(`api/v1/tenants/${tenantGlobalId}/receipts/${receiptGlobalId}`, config);
    return normalizeReceiptDates(data);
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};

export const createReceiptLink = async (tenantGlobalId: string, receiptGlobalId: string): Promise<string | null> => {
  try {
    const { data } = await axios.post<string>(
      `api/v1/tenants/${tenantGlobalId}/receipts/${receiptGlobalId}/sharedVerificationLinks`,
      undefined,
      config,
    );
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};

export const deleteReceiptLink = async (
  tenantGlobalId: string,
  receiptGlobalId: string,
  linkGlobalId: string,
): Promise<boolean> => {
  try {
    await axios.delete(
      `api/v1/tenants/${tenantGlobalId}/receipts/${receiptGlobalId}/sharedVerificationLinks/${linkGlobalId}`,
      config,
    );
    return true;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return false;
  }
};
