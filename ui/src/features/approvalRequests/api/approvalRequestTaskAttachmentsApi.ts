import axios from "@/shared/api/axios";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

const getPath = (tenantGlobalId: string, taskGlobalId: string) =>
  `api/v1/tenants/${tenantGlobalId}/tasks/${taskGlobalId}/attachments`;

const config = { useWorkEmployeeContext: true };

export const addApprovalRequestTaskAttachments = async (
  tenantGlobalId: string,
  taskGlobalId: string,
  userFileGlobalIds: string[],
): Promise<boolean> => {
  try {
    await axios.post(getPath(tenantGlobalId, taskGlobalId), { userFileGlobalIds }, config);
    return true;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return false;
  }
};

export const downloadApprovalRequestTaskAttachmentBase64 = async (
  tenantGlobalId: string,
  taskGlobalId: string,
  globalId: string,
): Promise<string | null> => {
  try {
    const { data } = await axios.get(`${getPath(tenantGlobalId, taskGlobalId)}/${globalId}/downloadBase64`, config);
    return data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};

export const removeApprovalRequestTaskAttachment = async (
  tenantGlobalId: string,
  taskGlobalId: string,
  globalId: string,
): Promise<boolean> => {
  try {
    await axios.delete(`${getPath(tenantGlobalId, taskGlobalId)}/${globalId}`, config);
    return true;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return false;
  }
};
