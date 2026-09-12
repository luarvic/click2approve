import { ApiPaths } from "@/shared/api/apiPaths";
import axios from "@/shared/api/axios";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

export interface ApiToken {
  createdAt: string;
  expiresAt: string | null;
  globalId: string;
  name: string;
}

interface CreatedApiToken {
  token: ApiToken;
  value: string;
}

export const createApiToken = async (name: string, expiresAt: string | null): Promise<CreatedApiToken | null> => {
  try {
    const { data } = await axios.post<CreatedApiToken>(ApiPaths.account.apiTokens.root, { expiresAt, name });
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return null;
  }
};

export const deleteApiToken = async (tokenGlobalId: string): Promise<boolean> => {
  try {
    await axios.delete(`${ApiPaths.account.apiTokens.root}/${encodeURIComponent(tokenGlobalId)}`);
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const listApiTokens = async (): Promise<ApiToken[]> => {
  try {
    const { data } = await axios.get<ApiToken[]>(ApiPaths.account.apiTokens.root);
    return data;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return [];
  }
};
