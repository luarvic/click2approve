import { AuthResponse } from "@/features/identity/models/authResponse";
import { CredentialsData } from "@/features/identity/models/credentials";
import { UserAccount } from "@/features/identity/models/userAccount";
import axios from "@/shared/api/axios";
import { ApiPaths } from "@/shared/api/apiPaths";
import { deleteTokens, writeTokens } from "@/shared/session/session";
import { getApiErrorNotification } from "@/shared/utils/apiErrorNotifications";
import { notification } from "@/shared/utils/notifications";

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

export const loginUser = async (credentials: CredentialsData): Promise<boolean> => {
  try {
    const { data } = await axios.post<AuthResponse>(ApiPaths.account.login, {
      email: credentials.email,
      password: credentials.password,
    });
    writeTokens(data);
    return true;
  } catch (e) {
    deleteTokens();
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
    writeTokens(data);
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
