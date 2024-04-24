import { toast } from "react-toastify";
import { IApprovalRequestTask } from "../../models/approvalRequestTask";
import { ApprovalStatus } from "../../models/approvalStatus";
import { getUserFriendlyApiErrorMessage } from "../../utils/helpers";
import axios from "../axios";

export const taskComplete = async (
  id: number,
  status: ApprovalStatus,
  comment: string | undefined
): Promise<void> => {
  try {
    await axios.post("api/task/complete", {
      id: id,
      status: status,
      comment: comment,
    });
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
  }
};

export const taskListUncompleted = async (): Promise<
  IApprovalRequestTask[]
> => {
  try {
    const { data } = await axios.get<IApprovalRequestTask[]>(
      "api/task/listUncompleted"
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const taskListCompleted = async (): Promise<IApprovalRequestTask[]> => {
  try {
    const { data } = await axios.get<IApprovalRequestTask[]>(
      "api/task/listCompleted"
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const taskCountUncompleted = async (): Promise<number> => {
  try {
    const { data } = await axios.get<number>("api/task/countUncompleted");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return 0;
  }
};
