import { toast } from "react-toastify";
import {
  ITenantUser,
  ITenantUserCreate,
  ITenantUserUpdate,
} from "../../models/tenantUser";
import { getUserFriendlyApiErrorMessage } from "../../utils/helpers";
import axios from "../axios";

export const tenantUserList = async (
  tenantId: number
): Promise<ITenantUser[]> => {
  try {
    const { data } = await axios.get<ITenantUser[]>(
      `api/tenants/${tenantId}/users`
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const tenantUserCreate = async (
  tenantId: number,
  payload: ITenantUserCreate
): Promise<ITenantUser | null> => {
  try {
    const { data } = await axios.post<ITenantUser>(
      `api/tenants/${tenantId}/users`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const tenantUserUpdate = async (
  tenantId: number,
  tenantUserId: number,
  payload: ITenantUserUpdate
): Promise<ITenantUser | null> => {
  try {
    const { data } = await axios.put<ITenantUser>(
      `api/tenants/${tenantId}/users/${tenantUserId}`,
      payload
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const tenantUserDelete = async (
  tenantId: number,
  tenantUserId: number
): Promise<boolean> => {
  try {
    await axios.delete(`api/tenants/${tenantId}/users/${tenantUserId}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
