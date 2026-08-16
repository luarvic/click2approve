import { UserFile } from "@/features/userFiles/models/userFile";
import axios from "@/shared/api/axios";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const uploadUserFiles = async (tenantGlobalId: string, files: FileList | File[]): Promise<UserFile[]> => {
  try {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    const { data } = await axios.post<UserFile[]>(`api/v1/tenants/${tenantGlobalId}/files/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const downloadUserFileBase64 = async (tenantGlobalId: string, globalId: string): Promise<string | null> => {
  try {
    const { data } = await axios.get(`api/v1/tenants/${tenantGlobalId}/files/${globalId}/downloadBase64`);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const deleteUserFile = async (tenantGlobalId: string, globalId: string): Promise<boolean> => {
  try {
    await axios.delete(`api/v1/tenants/${tenantGlobalId}/files/${globalId}`);
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};
