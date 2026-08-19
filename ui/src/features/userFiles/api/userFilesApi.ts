import { UserFile } from "@/features/userFiles/models/userFile";
import { normalizeUserFileDates } from "@/features/userFiles/utils/userFileDateNormalizers";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const uploadUserFiles = async (tenantGlobalId: string, files: FileList | File[]): Promise<UserFile[]> => {
  try {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    const { data } = await axios.post<UserFile[]>(ApiPaths.tenants.fileUpload(tenantGlobalId), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.map(normalizeUserFileDates);
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const downloadUserFileBase64 = async (tenantGlobalId: string, globalId: string): Promise<string | null> => {
  try {
    const { data } = await axios.get(ApiPaths.tenants.fileDownload(tenantGlobalId, globalId));
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const deleteUserFile = async (tenantGlobalId: string, globalId: string): Promise<boolean> => {
  try {
    await axios.delete(ApiPaths.tenants.file(tenantGlobalId, globalId));
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};
