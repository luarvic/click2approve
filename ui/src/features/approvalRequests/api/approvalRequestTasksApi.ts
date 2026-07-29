import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskListItem } from "@/features/approvalRequests/models/approvalRequestTaskListItem";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const completeApprovalRequestTask = async (
  tenantGlobalId: string,
  globalId: string,
  status: ApprovalRequestTaskStatus,
  comment: string | undefined
): Promise<boolean> => {
  try {
    await axios.post(`api/v1/tenants/${tenantGlobalId}/tasks/complete`, {
      globalId: globalId,
      status: status,
      comment: comment,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
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
    toast.error(getUserFriendlyApiErrorMessage(e));
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
    toast.error(getUserFriendlyApiErrorMessage(e));
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
    toast.error(getUserFriendlyApiErrorMessage(e));
    return 0;
  }
};
