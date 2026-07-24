import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const downloadApprovalRequestTaskFileBase64 = async (
  tenantId: number,
  id: number,
  approvalRequestTaskId: number,
): Promise<string | null> => {
  try {
    const { data } = await axios.get(
      `api/v1/tenants/${tenantId}/tasks/${approvalRequestTaskId}/files/${id}/downloadBase64`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};
