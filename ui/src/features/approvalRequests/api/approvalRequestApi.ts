import {
  ApprovalRequest,
  SubmitApprovalRequestRequest,
} from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestListItem } from "@/features/approvalRequests/models/approvalRequestListItem";
import {
  ApprovalRequestShareList,
  UpsertApprovalRequestShare,
} from "@/features/approvalRequests/models/approvalRequestShare";
import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { UserFile } from "@/features/userFiles/models/userFile";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const submitApprovalRequest = async (
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
    const { data } = await axios.post<number>("api/request", payload);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const cancelApprovalRequest = async (id: number): Promise<boolean> => {
  try {
    await axios.post(`api/request/${id}/cancel`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const updateApprovalRequest = async (
  id: number,
  steps: ApprovalStep[],
): Promise<boolean> => {
  try {
    await axios.put(`api/request/${id}/steps`, { steps });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const deleteApprovalRequest = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`api/request?id=${id}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const listApprovalRequests = async (): Promise<ApprovalRequestListItem[]> => {
  try {
    const { data } = await axios.get<ApprovalRequestListItem[]>("api/request/list");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const getApprovalRequest = async (
  id: number,
): Promise<ApprovalRequest | null> => {
  try {
    const { data } = await axios.get<ApprovalRequest>(`api/request/${id}`);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const listApprovalRequestShares = async (
  approvalRequestId: number,
): Promise<ApprovalRequestShareList | null> => {
  try {
    const { data } = await axios.get<ApprovalRequestShareList>(
      `api/request/${approvalRequestId}/shares`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const replaceApprovalRequestShares = async (
  approvalRequestId: number,
  shares: UpsertApprovalRequestShare[],
): Promise<boolean> => {
  try {
    await axios.put(`api/request/${approvalRequestId}/shares`, shares);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
