import {
  ApprovalDelegation,
  ApprovalDelegationUpsert,
} from "@/features/delegations/models/approvalDelegation";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const listApprovalDelegations = async (): Promise<ApprovalDelegation[]> => {
  try {
    const { data } = await axios.get<ApprovalDelegation[]>("api/delegations");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const createApprovalDelegation = async (
  payload: ApprovalDelegationUpsert,
): Promise<ApprovalDelegation | null> => {
  try {
    const { data } = await axios.post<ApprovalDelegation>(
      "api/delegations",
      payload,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const updateApprovalDelegation = async (
  delegationId: number,
  payload: ApprovalDelegationUpsert,
): Promise<ApprovalDelegation | null> => {
  try {
    const { data } = await axios.put<ApprovalDelegation>(
      `api/delegations/${delegationId}`,
      payload,
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteApprovalDelegation = async (
  delegationId: number,
): Promise<boolean> => {
  try {
    await axios.delete(`api/delegations/${delegationId}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
