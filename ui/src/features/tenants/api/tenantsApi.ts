import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import { uploadUserFiles } from "@/features/userFiles/api/userFilesApi";
import axios from "@/shared/api/axios";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export const getCurrentTenantId = async (): Promise<string | null> => {
  try {
    const { data } = await axios.get<{ globalId: string }>("api/v1/tenants/current");
    return data.globalId;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const listTenants = async (): Promise<Tenant[]> => {
  try {
    const { data } = await axios.get<Tenant[]>("api/v1/tenants");
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};

export const createTenant = async (payload: CreateTenantRequest): Promise<Tenant | null> => {
  try {
    const { data } = await axios.post<Tenant>("api/v1/tenants", payload);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const createTenantWithLogo = async (
  currentTenantGlobalId: string,
  payload: CreateTenantRequest,
  logo: File,
): Promise<Tenant | null> => {
  try {
    const [temporaryLogo] = await uploadUserFiles(currentTenantGlobalId, [logo]);
    if (!temporaryLogo) {
      return null;
    }

    const { data } = await axios.post<Tenant>("api/v1/tenants/withLogo", {
      ...payload,
      logoUserFileGlobalId: temporaryLogo.globalId,
    });
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const updateTenant = async (tenantGlobalId: string, payload: UpdateTenantRequest): Promise<Tenant | null> => {
  try {
    const { data } = await axios.put<Tenant>(`api/v1/tenants/${tenantGlobalId}`, payload);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const uploadTenantLogo = async (
  currentTenantGlobalId: string,
  tenantGlobalId: string,
  logo: File,
): Promise<Tenant | null> => {
  try {
    const [temporaryLogo] = await uploadUserFiles(currentTenantGlobalId, [logo]);
    if (!temporaryLogo) {
      return null;
    }

    const { data } = await axios.post<Tenant>(`api/v1/tenants/${tenantGlobalId}/logo`, {
      userFileGlobalId: temporaryLogo.globalId,
    });
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const deleteTenantLogo = async (tenantGlobalId: string): Promise<Tenant | null> => {
  try {
    const { data } = await axios.delete<Tenant>(`api/v1/tenants/${tenantGlobalId}/logo`);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};
