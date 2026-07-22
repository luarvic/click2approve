import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const downloadApprovalRequestFileBase64 = async (
  tenantId: number,
  id: number,
  approvalRequestId: number,
): Promise<string | null> => {
  try {
    const { data } = await axios.get(
      `api/tenants/${tenantId}/requests/${approvalRequestId}/files/${id}/downloadBase64`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};
