import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

const config = { useWorkEmployeeContext: true };

export const addApprovalRequestTaskAttachments = async (
  tenantGlobalId: string,
  taskGlobalId: string,
  userFileGlobalIds: string[],
): Promise<boolean> => {
  try {
    await axios.post(ApiPaths.tenants.taskAttachments(tenantGlobalId, taskGlobalId), { userFileGlobalIds }, config);
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
    const { data } = await axios.get(
      ApiPaths.tenants.taskAttachmentDownload(tenantGlobalId, taskGlobalId, globalId),
      config,
    );
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
    await axios.delete(ApiPaths.tenants.taskAttachment(tenantGlobalId, taskGlobalId, globalId), config);
    return true;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return false;
  }
};
