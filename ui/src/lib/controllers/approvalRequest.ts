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
): Promise<boolean> => {
  try {
    await axios.post("api/request", {
      userFileIds: files.map((userFile) => userFile.id.toString()),
      emails: approvers,
      approveBy: approveBy,
      comment: comment,
    });
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};

export const approvalRequestDelete = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`api/request?id=${id}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
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
