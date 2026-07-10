import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const completeApprovalRequestTask = async (
  id: number,
  status: ApprovalRequestTaskStatus,
  comment: string | undefined
): Promise<boolean> => {
  try {
    await axios.post("api/task/complete", {
      id: id,
      status: status,
      comment: comment,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const listApprovalRequestTasks = async (): Promise<
  ApprovalRequestTask[]
> => {
  try {
    const { data } = await axios.get<ApprovalRequestTask[]>("api/task/list");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const countUncompletedApprovalRequestTasks = async (): Promise<number> => {
  try {
    const { data } = await axios.get<number>("api/task/countUncompleted");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return 0;
  }
};
