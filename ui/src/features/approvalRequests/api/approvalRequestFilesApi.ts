import axios from "@/shared/api/axios";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const downloadApprovalRequestFileBase64 = async (
  tenantGlobalId: string,
  globalId: string,
  approvalRequestGlobalId: string,
): Promise<string | null> => {
  try {
    const { data } = await axios.get(
      `api/v1/tenants/${tenantGlobalId}/requests/${approvalRequestGlobalId}/files/${globalId}/downloadBase64`,
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};
