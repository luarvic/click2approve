import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import axios from "@/shared/api/axios";
import { getUserFriendlyApiErrorMessage } from "@/shared/utils/helpers";
import { toast } from "react-toastify";

export const getCurrentTenantId = async (): Promise<number | null> => {
  try {
    const { data } = await axios.get<{ id: number }>("api/tenant/current");
    return data.id;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const listTenants = async (): Promise<Tenant[]> => {
  try {
    const { data } = await axios.get<Tenant[]>("api/tenants");
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return [];
  }
};

export const createTenant = async (
  payload: CreateTenantRequest
): Promise<Tenant | null> => {
  try {
    const { data } = await axios.post<Tenant>("api/tenants", payload);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const createTenantWithLogo = async (
  payload: CreateTenantRequest,
  logo: File
): Promise<Tenant | null> => {
  try {
    const formData = new FormData();
    formData.append("businessName", payload.businessName);
    if (payload.email) {
      formData.append("email", payload.email);
    }
    if (payload.phone) {
      formData.append("phone", payload.phone);
    }
    if (payload.address) {
      formData.append("address", payload.address);
    }
    if (payload.websiteUrl) {
      formData.append("websiteUrl", payload.websiteUrl);
    }
    formData.append("logo", logo);

    const { data } = await axios.post<Tenant>(
      "api/tenants/withLogo",
      formData
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const updateTenant = async (
  tenantId: number,
  payload: UpdateTenantRequest
): Promise<Tenant | null> => {
  try {
    const { data } = await axios.put<Tenant>(`api/tenants/${tenantId}`, payload);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const uploadTenantLogo = async (
  tenantId: number,
  logo: File
): Promise<Tenant | null> => {
  try {
    const formData = new FormData();
    formData.append("logo", logo);
    const { data } = await axios.post<Tenant>(
      `api/tenants/${tenantId}/logo`,
      formData
    );
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const downloadTenantLogo = async (logoUrl: string): Promise<Blob | null> => {
  try {
    const { data } = await axios.get<Blob>(logoUrl, { responseType: "blob" });
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteTenantLogo = async (
  tenantId: number
): Promise<Tenant | null> => {
  try {
    const { data } = await axios.delete<Tenant>(`api/tenants/${tenantId}/logo`);
    return data;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return null;
  }
};

export const deleteTenant = async (tenantId: number): Promise<boolean> => {
  try {
    await axios.delete(`api/tenants/${tenantId}`);
    return true;
  } catch (e) {
    toast.error(getUserFriendlyApiErrorMessage(e));
    return false;
  }
};
