import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/models/approvalRequestTaskClientAuditContext";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import {
  ApprovalRequestTaskGridQuery,
  defaultApprovalRequestTaskGridQuery,
  serializeApprovalRequestTaskGridQuery,
} from "@/features/approvalRequests/models/approvalRequestTaskGridQuery";
import {
  normalizeApprovalRequestDates,
  normalizeApprovalRequestTaskDates,
} from "@/features/approvalRequests/utils/approvalRequestDateNormalizers";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification, isResourceNotFoundOrForbiddenError } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";
import type { GridPage } from "@/shared/grids/gridPage";

export const completeApprovalRequestTask = async (
  tenantGlobalId: string,
  globalId: string,
  result: boolean,
  comment: string | undefined,
  electronicSignature?: {
    assigneeLegalName?: string;
    assigneeRepresentationDetails?: string;
    assigneeSignatureJson?: string;
  },
  clientAuditContext?: ApprovalRequestTaskClientAuditContext,
): Promise<boolean> => {
  try {
    await axios.post(
      ApiPaths.tenants.taskComplete(tenantGlobalId),
      {
        globalId: globalId,
        result: result,
        comment: comment,
        clientAuditContext: clientAuditContext,
        ...electronicSignature,
      },
      { useWorkEmployeeContext: true },
    );
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const listApprovalRequestTaskGrid = async (
  tenantGlobalId: string,
  query: ApprovalRequestTaskGridQuery,
): Promise<GridPage<ApprovalRequestTaskListItem>> => {
  try {
    const { data } = await axios.get<GridPage<ApprovalRequestTaskListItem>>(
      `${ApiPaths.tenants.tasks(tenantGlobalId)}?${serializeApprovalRequestTaskGridQuery(query)}`,
      { useWorkEmployeeContext: true },
    );
    data.items.forEach(normalizeApprovalRequestTaskDates);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return { items: [], totalCount: 0 };
  }
};

export const listApprovalRequestTasks = async (tenantGlobalId: string): Promise<ApprovalRequestTaskListItem[]> =>
  (await listApprovalRequestTaskGrid(tenantGlobalId, { ...defaultApprovalRequestTaskGridQuery, pageSize: 100 })).items;

export const getApprovalRequestTask = async (
  tenantGlobalId: string,
  globalId: string,
): Promise<ApprovalRequestTask | null> => {
  try {
    const { data } = await axios.get<ApprovalRequestTask>(ApiPaths.tenants.task(tenantGlobalId, globalId), {
      useWorkEmployeeContext: true,
    });
    normalizeApprovalRequestTaskDates(data);
    if (data.approvalRequest) {
      normalizeApprovalRequestDates(data.approvalRequest);
    }
    return data;
  } catch (e) {
    if (isResourceNotFoundOrForbiddenError(e)) {
      return null;
    }
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const countUncompletedApprovalRequestTasks = async (tenantGlobalId: string): Promise<number> => {
  try {
    const { data } = await axios.get<number>(ApiPaths.tenants.uncompletedTaskCount(tenantGlobalId), {
      useWorkEmployeeContext: true,
    });
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return 0;
  }
};
