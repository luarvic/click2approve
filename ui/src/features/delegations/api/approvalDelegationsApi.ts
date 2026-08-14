import { ApprovalDelegation, ApprovalDelegationUpsert } from "@/features/delegations/models/approvalDelegation";
import axios from "@/shared/api/axios";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const listApprovalDelegations = async (tenantGlobalId: string): Promise<ApprovalDelegation[]> => {
  try {
    const { data } = await axios.get<ApprovalDelegation[]>(`api/v1/tenants/${tenantGlobalId}/delegations`);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const createApprovalDelegation = async (
  tenantGlobalId: string,
  payload: ApprovalDelegationUpsert,
): Promise<ApprovalDelegation | null> => {
  try {
    const { data } = await axios.post<ApprovalDelegation>(`api/v1/tenants/${tenantGlobalId}/delegations`, payload);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const updateApprovalDelegation = async (
  tenantGlobalId: string,
  delegationGlobalId: string,
  payload: ApprovalDelegationUpsert,
): Promise<ApprovalDelegation | null> => {
  try {
    const { data } = await axios.put<ApprovalDelegation>(
      `api/v1/tenants/${tenantGlobalId}/delegations/${delegationGlobalId}`,
      payload,
    );
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const deleteApprovalDelegation = async (
  tenantGlobalId: string,
  delegationGlobalId: string,
): Promise<boolean> => {
  try {
    await axios.delete(`api/v1/tenants/${tenantGlobalId}/delegations/${delegationGlobalId}`);
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};
