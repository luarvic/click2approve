import { toast } from "react-toastify";
import { ITenant, ITenantCreate, ITenantUpdate } from "../../models/tenant";
import { getUserFriendlyApiErrorMessage } from "../../utils/helpers";
import axios from "../axios";

export const tenantList = async (): Promise<ITenant[]> => {
  try {
    const { data } = await axios.get<ITenant[]>("api/tenants");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const tenantCreate = async (
  payload: ITenantCreate
): Promise<ITenant | null> => {
  try {
    const { data } = await axios.post<ITenant>("api/tenants", payload);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const tenantUpdate = async (
  tenantId: number,
  payload: ITenantUpdate
): Promise<ITenant | null> => {
  try {
    const { data } = await axios.put<ITenant>(`api/tenants/${tenantId}`, payload);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const tenantDelete = async (tenantId: number): Promise<boolean> => {
  try {
    await axios.delete(`api/tenants/${tenantId}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
