import { UserFile } from "@/features/userFiles/models/userFile";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const uploadUserFiles = async (
  tenantId: number,
  files: FileList | File[]
): Promise<UserFile[]> => {
  try {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    const { data } = await axios.post<UserFile[]>(
      `api/tenants/${tenantId}/files/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const downloadUserFileBase64 = async (
  tenantId: number,
  id: number
): Promise<string | null> => {
  try {
    const { data } = await axios.get(
      `api/tenants/${tenantId}/files/downloadBase64?id=${id}`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const downloadApprovalRequestFileBase64 = async (
  tenantId: number,
  id: number,
  approvalRequestId: number,
): Promise<string | null> => {
  try {
    const { data } = await axios.get(
      `api/tenants/${tenantId}/files/downloadBase64ForApprovalRequest?id=${id}&approvalRequestId=${approvalRequestId}`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const downloadApprovalRequestTaskFileBase64 = async (
  tenantId: number,
  id: number,
  approvalRequestTaskId: number,
): Promise<string | null> => {
  try {
    const { data } = await axios.get(
      `api/tenants/${tenantId}/files/downloadBase64ForApprovalRequestTask?id=${id}&approvalRequestTaskId=${approvalRequestTaskId}`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};
