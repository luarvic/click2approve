import type { Receipt, ReceiptListItem } from "@/features/receipts/models/receipt";
import { type ReceiptGridQuery, serializeReceiptGridQuery } from "@/features/receipts/models/receiptGridQuery";
import { normalizeReceiptDates } from "@/features/receipts/utils/receiptDateNormalizers";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import type { GridPage } from "@/shared/grids/gridPage";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { parseUtcDateTime } from "@/shared/utils/dateTime";
import { notification } from "@/shared/utils/notifications";

const config = { useWorkEmployeeContext: true };

export const listReceiptGrid = async (
  tenantGlobalId: string,
  query: ReceiptGridQuery,
): Promise<GridPage<ReceiptListItem>> => {
  try {
    const { data } = await axios.get<GridPage<ReceiptListItem>>(
      `${ApiPaths.tenants.receipts(tenantGlobalId)}?${serializeReceiptGridQuery(query)}`,
      config,
    );
    data.items.forEach((receipt) => {
      receipt.createdAt = parseUtcDateTime(receipt.createdAt as unknown as string);
    });
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return { items: [], totalCount: 0 };
  }
};

export const deleteReceipt = async (tenantGlobalId: string, receiptGlobalId: string): Promise<boolean> => {
  try {
    await axios.delete(ApiPaths.tenants.receipt(tenantGlobalId, receiptGlobalId), config);
    return true;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return false;
  }
};

export const getReceipt = async (tenantGlobalId: string, receiptGlobalId: string): Promise<Receipt | null> => {
  try {
    const { data } = await axios.get<Receipt>(ApiPaths.tenants.receipt(tenantGlobalId, receiptGlobalId), config);
    return normalizeReceiptDates(data);
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};

export const createReceiptLink = async (tenantGlobalId: string, receiptGlobalId: string): Promise<string | null> => {
  try {
    const { data } = await axios.post<string>(
      ApiPaths.tenants.receiptLinks(tenantGlobalId, receiptGlobalId),
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
    await axios.delete(ApiPaths.tenants.receiptLink(tenantGlobalId, receiptGlobalId, linkGlobalId), config);
    return true;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return false;
  }
};
