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
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const submitApprovalRequest = async (
  tenantId: number,
  title: string,
  steps: ApprovalStep[],
  stepVisibility: ApprovalRequestStepVisibilitySubmission[],
  description: string | undefined,
  previousRevisionApprovalRequestId?: number,
  requestFiles: ApprovalRequestFileSubmission[] = [],
): Promise<number | null> => {
  try {
    const payload: SubmitApprovalRequestRequest = {
      title,
      previousRevisionApprovalRequestId,
      requestFiles,
      steps,
      stepVisibility,
      description,
    };
    const { data } = await axios.post<number>(
      `api/v1/tenants/${tenantId}/requests`,
      payload,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const resubmitApprovalRequest = async (
  tenantId: number,
  id: number,
  steps: ApprovalStep[],
  stepVisibility: ApprovalRequestStepVisibilitySubmission[],
  description: string | undefined,
  requestFiles: ApprovalRequestFileSubmission[],
): Promise<number | null> => {
  try {
    const payload: ResubmitApprovalRequestRequest = {
      requestFiles,
      steps,
      stepVisibility,
      description,
    };
    const { data } = await axios.post<number>(
      `api/v1/tenants/${tenantId}/requests/${id}/resubmit`,
      payload,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const cancelApprovalRequest = async (
  tenantId: number,
  id: number,
): Promise<boolean> => {
  try {
    await axios.post(`api/v1/tenants/${tenantId}/requests/${id}/cancel`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const listApprovalRequests = async (
  tenantId: number,
): Promise<ApprovalRequestListItem[]> => {
  try {
    const { data } = await axios.get<ApprovalRequestListItem[]>(
      `api/v1/tenants/${tenantId}/requests`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const getApprovalRequest = async (
  tenantId: number,
  id: number,
): Promise<ApprovalRequest | null> => {
  try {
    const { data } = await axios.get<ApprovalRequest>(
      `api/v1/tenants/${tenantId}/requests/${id}`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};
