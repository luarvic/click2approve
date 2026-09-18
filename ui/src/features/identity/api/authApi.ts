import { AuthResponse } from "@/features/identity/models/authResponse";
import { CredentialsData } from "@/features/identity/models/credentials";
import { EmailConfirmationRequired, MfaRequired, TwoFactorCredentials } from "@/features/identity/models/mfa";
import { UserAccount } from "@/features/identity/models/userAccount";
import { ApiPaths } from "@/shared/api/apiPaths";
import axios from "@/shared/api/axios";
import { writeTokens } from "@/shared/session/session";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";
import { isAxiosError } from "axios";

export const registerUser = async (credentials: CredentialsData): Promise<boolean> => {
  try {
    await axios.post(ApiPaths.account.register, {
      email: credentials.email,
      password: credentials.password,
    });
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const confirmUserEmail = async (userId: string, code: string): Promise<boolean> => {
  try {
    await axios.get(`${ApiPaths.account.confirmEmail}?userId=${userId}&code=${code}`);
    return true;
  } catch {
    return false;
  }
};

export const loginUser = async (
  credentials: CredentialsData,
  factor: TwoFactorCredentials = {},
): Promise<boolean | EmailConfirmationRequired | MfaRequired> => {
  try {
    const { data } = await axios.post<AuthResponse>(ApiPaths.account.login, {
      email: credentials.email,
      password: credentials.password,
      ...factor,
    });
    writeTokens(data);
    return true;
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 401 && e.response.data?.detail === "RequiresTwoFactor")
      return { requiresTwoFactor: true };
    if (isAxiosError(e) && e.response?.status === 401 && e.response.data?.detail === "RequiresEmailConfirmation")
      return { requiresEmailConfirmation: true };
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const resendUserConfirmationEmail = async (email: string): Promise<boolean> => {
  try {
    await axios.post(ApiPaths.account.resendConfirmationEmail, {
      email: email,
    });
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const requestUserPasswordReset = async (email: string): Promise<boolean> => {
  try {
    await axios.post(ApiPaths.account.forgotPassword, {
      email: email,
    });
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const resetUserPassword = async (email: string, code: string, password: string): Promise<boolean> => {
  try {
    await axios.post(ApiPaths.account.resetPassword, {
      email: email,
      resetCode: code,
      newPassword: password,
    });
    return true;
  } catch (e) {
    notification.error(getApiErrorNotification(e));
    return false;
  }
};

export const refreshAuthSession = async (refreshToken: string): Promise<AuthResponse | null> => {
  try {
    const { data } = await axios.post<AuthResponse>(ApiPaths.account.refresh, {
      refreshToken: refreshToken,
    });
    return data;
  } catch (e) {
    return null;
  }
};

export const getUserAccountManageInfo = async (): Promise<UserAccount | null> => {
  try {
    const { data } = await axios.get<UserAccount>(ApiPaths.account.manageInfo);
    return data;
  } catch (e) {
    return null;
  }
};
