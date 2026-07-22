import {
  ApprovalRequest,
  SubmitApprovalRequestRequest,
} from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { UserFile } from "@/features/userFiles/models/userFile";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const submitApprovalRequest = async (
  tenantId: number,
  title: string,
  files: UserFile[],
  steps: ApprovalStep[],
  description: string | undefined,
): Promise<number | null> => {
  try {
    const payload: SubmitApprovalRequestRequest = {
      title,
      userFileIds: files.map((userFile) => userFile.id),
      steps,
      description,
    };
    const { data } = await axios.post<number>(
      `api/tenants/${tenantId}/requests`,
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
    await axios.post(`api/tenants/${tenantId}/requests/${id}/cancel`);
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
      `api/tenants/${tenantId}/requests`,
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
      `api/tenants/${tenantId}/requests/${id}`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};
