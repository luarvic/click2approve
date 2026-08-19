import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/models/approvalRequestTaskClientAuditContext";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import {
  normalizeApprovalRequestDates,
  normalizeApprovalRequestTaskDates,
} from "@/features/approvalRequests/utils/approvalRequestDateNormalizers";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification, isResourceNotFoundOrForbiddenError } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

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

export const listApprovalRequestTasks = async (tenantGlobalId: string): Promise<ApprovalRequestTaskListItem[]> => {
  try {
    const { data } = await axios.get<ApprovalRequestTaskListItem[]>(ApiPaths.tenants.tasks(tenantGlobalId), {
      useWorkEmployeeContext: true,
    });
    data.forEach(normalizeApprovalRequestTaskDates);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

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
