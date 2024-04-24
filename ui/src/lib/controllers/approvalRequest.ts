import { toast } from "react-toastify";
import { IApprovalRequest } from "../../models/approvalRequest";
import { IUserFile } from "../../models/userFile";
import { getUserFriendlyApiErrorMessage } from "../../utils/helpers";
import axios from "../axios";

export const approvalRequestSubmit = async (
  files: IUserFile[],
  approvers: string[],
  approveBy: Date | null,
  comment: string | undefined
): Promise<void> => {
  try {
    await axios.post("api/request", {
      userFileIds: files.map((userFile) => userFile.id.toString()),
      emails: approvers,
      approveBy: approveBy,
      comment: comment,
    });
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
  }
};

export const approvalRequestDelete = async (id: number): Promise<void> => {
  try {
    await axios.delete(`api/request?id=${id}`);
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
  }
};

export const approvalRequestList = async (): Promise<IApprovalRequest[]> => {
  try {
    const { data } = await axios.get<IApprovalRequest[]>("api/request/list");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};
