import {
  SharedVerificationLinkListItem,
  SharedVerificationReceipt,
} from "@/features/sharedVerificationLinks/models/sharedVerificationLink";
import axios from "@/shared/api/axios";
import { getApiErrorNotification, isResourceNotFoundOrForbiddenError } from "@/shared/utils/apiErrorNotifications";
import { parseUtcDateTime } from "@/shared/utils/dateTime";
import { notification } from "@/shared/utils/notifications";

const config = { useWorkEmployeeContext: true };

export const createSharedVerificationLinkForRequest = async (
  tenantGlobalId: string,
  approvalRequestGlobalId: string,
): Promise<string | null> => {
  try {
    const { data } = await axios.post<string>(
      `api/v1/tenants/${tenantGlobalId}/requests/${approvalRequestGlobalId}/sharedVerificationLinks`,
      undefined,
      config,
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const createSharedVerificationLinkForTask = async (
  tenantGlobalId: string,
  approvalRequestTaskGlobalId: string,
): Promise<string | null> => {
  try {
    const { data } = await axios.post<string>(
      `api/v1/tenants/${tenantGlobalId}/tasks/${approvalRequestTaskGlobalId}/sharedVerificationLinks`,
      undefined,
      config,
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const getSharedVerificationReceipt = async (globalId: string): Promise<SharedVerificationReceipt | null> => {
  try {
    const { data } = await axios.get<SharedVerificationReceipt>(`api/v1/sharedVerificationLinks/${globalId}`);
    normalizeReceiptDates(data);
    return data;
  } catch (e) {
    if (isResourceNotFoundOrForbiddenError(e)) {
      return null;
    }
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const listSharedVerificationLinksForRequest = async (
  tenantGlobalId: string,
  approvalRequestGlobalId: string,
): Promise<SharedVerificationLinkListItem[]> => {
  try {
    const { data } = await axios.get<SharedVerificationLinkListItem[]>(
      `api/v1/tenants/${tenantGlobalId}/requests/${approvalRequestGlobalId}/sharedVerificationLinks`,
      config,
    );
    data.forEach(normalizeListItemDates);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const listSharedVerificationLinksForTask = async (
  tenantGlobalId: string,
  approvalRequestTaskGlobalId: string,
): Promise<SharedVerificationLinkListItem[]> => {
  try {
    const { data } = await axios.get<SharedVerificationLinkListItem[]>(
      `api/v1/tenants/${tenantGlobalId}/tasks/${approvalRequestTaskGlobalId}/sharedVerificationLinks`,
      config,
    );
    data.forEach(normalizeListItemDates);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const deleteSharedVerificationLinkForRequest = async (
  tenantGlobalId: string,
  approvalRequestGlobalId: string,
  linkGlobalId: string,
): Promise<boolean> => {
  try {
    await axios.delete(
      `api/v1/tenants/${tenantGlobalId}/requests/${approvalRequestGlobalId}/sharedVerificationLinks/${linkGlobalId}`,
      config,
    );
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const deleteSharedVerificationLinkForTask = async (
  tenantGlobalId: string,
  approvalRequestTaskGlobalId: string,
  linkGlobalId: string,
): Promise<boolean> => {
  try {
    await axios.delete(
      `api/v1/tenants/${tenantGlobalId}/tasks/${approvalRequestTaskGlobalId}/sharedVerificationLinks/${linkGlobalId}`,
      config,
    );
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

const normalizeListItemDates = (item: SharedVerificationLinkListItem): void => {
  item.createdAt = parseReceiptDate(item.createdAt);
};

const normalizeReceiptDates = (receipt: SharedVerificationReceipt): void => {
  receipt.approvalRequestCreatedAt = parseReceiptDate(receipt.approvalRequestCreatedAt);
  receipt.approvalRequestApprovedAt = receipt.approvalRequestApprovedAt
    ? parseReceiptDate(receipt.approvalRequestApprovedAt)
    : undefined;
  receipt.createdAt = parseReceiptDate(receipt.createdAt);
  receipt.participants?.forEach((participant) => {
    participant.completedAt = participant.completedAt ? parseReceiptDate(participant.completedAt) : undefined;
  });
};

const parseReceiptDate = (value: Date): Date => parseUtcDateTime(value as unknown as string);
