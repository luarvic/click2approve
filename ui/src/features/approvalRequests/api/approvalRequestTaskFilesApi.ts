import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const downloadApprovalRequestTaskFileBase64 = async (
  tenantGlobalId: string,
  globalId: string,
  approvalRequestTaskGlobalId: string,
): Promise<string | null> => {
  try {
    const { data } = await axios.get(
      `api/v1/tenants/${tenantGlobalId}/tasks/${approvalRequestTaskGlobalId}/files/${globalId}/downloadBase64`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};
