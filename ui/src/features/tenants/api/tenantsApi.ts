import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const getCurrentTenantId = async (): Promise<string | null> => {
  try {
    const { data } = await axios.get<{ globalId: string }>(ApiPaths.tenants.current);
    return data.globalId;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const listTenants = async (): Promise<Tenant[]> => {
  try {
    const { data } = await axios.get<Tenant[]>(ApiPaths.tenants.root);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const createTenant = async (payload: CreateTenantRequest): Promise<Tenant | null> => {
  try {
    const { data } = await axios.post<Tenant>(ApiPaths.tenants.root, payload);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const createTenantWithLogo = async (payload: CreateTenantRequest, logo: File): Promise<Tenant | null> => {
  try {
    const formData = new FormData();
    formData.append("businessName", payload.businessName);
    formData.append("email", payload.email ?? "");
    formData.append("phone", payload.phone ?? "");
    formData.append("address", payload.address ?? "");
    formData.append("websiteUrl", payload.websiteUrl ?? "");
    formData.append("logo", logo);
    const { data } = await axios.post<Tenant>(ApiPaths.tenants.withLogo, formData);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const updateTenant = async (tenantGlobalId: string, payload: UpdateTenantRequest): Promise<Tenant | null> => {
  try {
    const { data } = await axios.put<Tenant>(ApiPaths.tenants.byId(tenantGlobalId), payload);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const uploadTenantLogo = async (tenantGlobalId: string, logo: File): Promise<Tenant | null> => {
  try {
    const formData = new FormData();
    formData.append("logo", logo);
    const { data } = await axios.post<Tenant>(ApiPaths.tenants.logo(tenantGlobalId), formData);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const deleteTenantLogo = async (tenantGlobalId: string): Promise<Tenant | null> => {
  try {
    const { data } = await axios.delete<Tenant>(ApiPaths.tenants.logo(tenantGlobalId));
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};
