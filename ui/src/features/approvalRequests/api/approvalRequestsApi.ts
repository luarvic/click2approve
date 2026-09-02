import {
  ApprovalRequest,
  ApprovalRequestFileSubmission,
  ResubmitApprovalRequestRequest,
  SubmitApprovalRequestRequest,
} from "@/features/approvalRequests/models/approvalRequest";
import {
  ApprovalRequestGridQuery,
  defaultApprovalRequestGridQuery,
  serializeApprovalRequestGridQuery,
} from "@/features/approvalRequests/models/approvalRequestGridQuery";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import { normalizeApprovalRequestDates } from "@/features/approvalRequests/utils/approvalRequestDateNormalizers";
import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { ApiPaths } from "@/shared/api/apiPaths";
import axios from "@/shared/api/axios";
import type { GridPage } from "@/shared/grids/gridPage";
import { getApiErrorNotification, isResourceNotFoundOrForbiddenError } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const submitApprovalRequest = async (
  tenantGlobalId: string,
  title: string,
  steps: ApprovalStep[],
  description: string | undefined,
  previousRevisionApprovalRequestGlobalId?: string,
  requestFiles: ApprovalRequestFileSubmission[] = [],
): Promise<string | null> => {
  try {
    const payload: SubmitApprovalRequestRequest = {
      title,
      previousRevisionApprovalRequestGlobalId,
      requestFiles,
      steps,
      description,
    };
    const { data } = await axios.post<string>(ApiPaths.tenants.requests(tenantGlobalId), payload, {
      useWorkEmployeeContext: true,
    });
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const resubmitApprovalRequest = async (
  tenantGlobalId: string,
  globalId: string,
  steps: ApprovalStep[],
  description: string | undefined,
  requestFiles: ApprovalRequestFileSubmission[],
): Promise<string | null> => {
  try {
    const payload: ResubmitApprovalRequestRequest = {
      requestFiles,
      steps,
      description,
    };
    const { data } = await axios.post<string>(ApiPaths.tenants.requestResubmit(tenantGlobalId, globalId), payload, {
      useWorkEmployeeContext: true,
    });
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const cancelApprovalRequest = async (tenantGlobalId: string, globalId: string): Promise<boolean> => {
  try {
    await axios.post(ApiPaths.tenants.requestCancel(tenantGlobalId, globalId), undefined, {
      useWorkEmployeeContext: true,
    });
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const deleteApprovalRequest = async (tenantGlobalId: string, globalId: string): Promise<boolean> => {
  try {
    await axios.delete(ApiPaths.tenants.request(tenantGlobalId, globalId), { useWorkEmployeeContext: true });
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const listApprovalRequestGrid = async (
  tenantGlobalId: string,
  query: ApprovalRequestGridQuery,
): Promise<GridPage<ApprovalRequestListItem>> => {
  try {
    const { data } = await axios.get<GridPage<ApprovalRequestListItem>>(
      `${ApiPaths.tenants.requests(tenantGlobalId)}?${serializeApprovalRequestGridQuery(query)}`,
      {
        useWorkEmployeeContext: true,
      },
    );
    data.items.forEach(normalizeApprovalRequestDates);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return { items: [], totalCount: 0 };
  }
};

export const listApprovalRequests = async (tenantGlobalId: string): Promise<ApprovalRequestListItem[]> =>
  (await listApprovalRequestGrid(tenantGlobalId, { ...defaultApprovalRequestGridQuery, pageSize: 100 })).items;

export const getApprovalRequest = async (tenantGlobalId: string, globalId: string): Promise<ApprovalRequest | null> => {
  try {
    const { data } = await axios.get<ApprovalRequest>(ApiPaths.tenants.request(tenantGlobalId, globalId), {
      useWorkEmployeeContext: true,
    });
    normalizeApprovalRequestDates(data);
    return data;
  } catch (e) {
    if (isResourceNotFoundOrForbiddenError(e)) {
      return null;
    }
    notification.error(getApiErrorNotification(e));
    return null;
  }
};
