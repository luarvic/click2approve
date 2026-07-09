import {
  ApprovalRequest,
  SubmitApprovalRequestRequest,
} from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import { UserFile } from "@/features/userFiles/models/userFile";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const submitApprovalRequest = async (
  title: string,
  files: UserFile[],
  steps: ApprovalStep[],
  approveBy: Date | null,
  comment: string | undefined,
  clonedFromApprovalRequestId?: number
): Promise<boolean> => {
  try {
    const payload: SubmitApprovalRequestRequest = {
      title,
      userFileIds: files.map((userFile) => userFile.id),
      steps,
      approveBy: approveBy,
      comment: comment,
      clonedFromApprovalRequestId,
    };
    await axios.post("api/request", payload);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
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

export const updateApprovalRequestSteps = async (
  id: number,
  steps: ApprovalStep[]
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

export const listApprovalRequests = async (): Promise<ApprovalRequest[]> => {
  try {
    const { data } = await axios.get<ApprovalRequest[]>("api/request/list");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};
