import {
  ApprovalDelegation,
  ApprovalDelegationUpsert,
} from "@/features/delegations/models/approvalDelegation";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const listApprovalDelegations = async (
  tenantId: number,
): Promise<ApprovalDelegation[]> => {
  try {
    const { data } = await axios.get<ApprovalDelegation[]>(
      `api/v1/tenants/${tenantId}/delegations`,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const createApprovalDelegation = async (
  tenantId: number,
  payload: ApprovalDelegationUpsert,
): Promise<ApprovalDelegation | null> => {
  try {
    const { data } = await axios.post<ApprovalDelegation>(
      `api/v1/tenants/${tenantId}/delegations`,
      payload,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const updateApprovalDelegation = async (
  tenantId: number,
  delegationId: number,
  payload: ApprovalDelegationUpsert,
): Promise<ApprovalDelegation | null> => {
  try {
    const { data } = await axios.put<ApprovalDelegation>(
      `api/v1/tenants/${tenantId}/delegations/${delegationId}`,
      payload,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteApprovalDelegation = async (
  tenantId: number,
  delegationId: number,
): Promise<boolean> => {
  try {
    await axios.delete(`api/v1/tenants/${tenantId}/delegations/${delegationId}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
