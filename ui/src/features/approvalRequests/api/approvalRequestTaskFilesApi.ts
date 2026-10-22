import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const downloadApprovalRequestTaskFileBase64 = async (
  tenantGlobalId: string,
  globalId: string,
  approvalRequestTaskGlobalId: string,
): Promise<string | null> => {
  try {
    const { data } = await axios.get(
      ApiPaths.tenants.taskRequestAttachmentDownload(tenantGlobalId, approvalRequestTaskGlobalId, globalId),
      { useWorkEmployeeContext: true },
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};
