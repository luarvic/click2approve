import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskClientAuditContext } from "@/features/approvalRequests/models/approvalRequestTaskClientAuditContext";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import axios from "@/shared/api/axios";
import {
  getApiErrorNotification,
  isResourceNotFoundOrForbiddenError,
} from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const completeApprovalRequestTask = async (
  tenantGlobalId: string,
  globalId: string,
  result: boolean,
  comment: string | undefined,
  electronicSignature?: {
    assigneeLegalName?: string;
    assigneeOrganization?: string;
    assigneeSignatureJson?: string;
  },
  clientAuditContext?: ApprovalRequestTaskClientAuditContext,
): Promise<boolean> => {
  try {
    await axios.post(`api/v1/tenants/${tenantGlobalId}/tasks/complete`, {
      globalId: globalId,
      result: result,
      comment: comment,
      clientAuditContext: clientAuditContext,
      ...electronicSignature,
    });
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const listApprovalRequestTasks = async (
  tenantGlobalId: string,
): Promise<
  ApprovalRequestTaskListItem[]
> => {
  try {
    const { data } = await axios.get<ApprovalRequestTaskListItem[]>(
      `api/v1/tenants/${tenantGlobalId}/tasks`,
    );
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
    const { data } = await axios.get<ApprovalRequestTask>(
      `api/v1/tenants/${tenantGlobalId}/tasks/${globalId}`,
    );
    return data;
  } catch (e) {
    if (isResourceNotFoundOrForbiddenError(e)) {
      return null;
    }
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const countUncompletedApprovalRequestTasks = async (
  tenantGlobalId: string,
): Promise<number> => {
  try {
    const { data } = await axios.get<number>(
      `api/v1/tenants/${tenantGlobalId}/tasks/uncompleted/count`,
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return 0;
  }
};
