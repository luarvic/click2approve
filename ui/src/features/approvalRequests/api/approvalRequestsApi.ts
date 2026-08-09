import {
  ApprovalRequest,
  ApprovalRequestFileSubmission,
  ApprovalRequestStepVisibilitySubmission,
  ResubmitApprovalRequestRequest,
  SubmitApprovalRequestRequest,
} from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import axios from "@/shared/api/axios";
import {
  getApiErrorNotification,
  isResourceNotFoundOrForbiddenError,
} from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const submitApprovalRequest = async (
  tenantGlobalId: string,
  title: string,
  steps: ApprovalStep[],
  stepVisibility: ApprovalRequestStepVisibilitySubmission[],
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
      stepVisibility,
      description,
    };
    const { data } = await axios.post<string>(
      `api/v1/tenants/${tenantGlobalId}/requests`,
      payload,
      { useWorkEmployeeContext: true },
    );
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
  stepVisibility: ApprovalRequestStepVisibilitySubmission[],
  description: string | undefined,
  requestFiles: ApprovalRequestFileSubmission[],
): Promise<string | null> => {
  try {
    const payload: ResubmitApprovalRequestRequest = {
      requestFiles,
      steps,
      stepVisibility,
      description,
    };
    const { data } = await axios.post<string>(
      `api/v1/tenants/${tenantGlobalId}/requests/${globalId}/resubmit`,
      payload,
      { useWorkEmployeeContext: true },
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const cancelApprovalRequest = async (
  tenantGlobalId: string,
  globalId: string,
): Promise<boolean> => {
  try {
    await axios.post(`api/v1/tenants/${tenantGlobalId}/requests/${globalId}/cancel`, undefined, { useWorkEmployeeContext: true });
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const listApprovalRequests = async (
  tenantGlobalId: string,
): Promise<ApprovalRequestListItem[]> => {
  try {
    const { data } = await axios.get<ApprovalRequestListItem[]>(
      `api/v1/tenants/${tenantGlobalId}/requests`,
      { useWorkEmployeeContext: true },
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const getApprovalRequest = async (
  tenantGlobalId: string,
  globalId: string,
): Promise<ApprovalRequest | null> => {
  try {
    const { data } = await axios.get<ApprovalRequest>(
      `api/v1/tenants/${tenantGlobalId}/requests/${globalId}`,
      { useWorkEmployeeContext: true },
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
