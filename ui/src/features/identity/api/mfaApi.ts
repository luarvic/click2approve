import { MfaStatus, TwoFactorRequest, TwoFactorResponse } from "@/features/identity/models/mfa";
import { ApiPaths } from "@/shared/api/apiPaths";
import axios from "@/shared/api/axios";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

const request = async <T>(action: () => Promise<{ data: T }>): Promise<T | null> => {
  try {
    return (await action()).data;
  } catch (error) {
    notification.error(getApiErrorNotification(error));
    return null;
  }
};

export const getMfaStatus = () => request<MfaStatus>(() => axios.get(ApiPaths.account.mfaStatus));
export const manageTwoFactor = (settings: TwoFactorRequest = {}) =>
  request<TwoFactorResponse>(() => axios.post(ApiPaths.account.manageTwoFactor, settings));
